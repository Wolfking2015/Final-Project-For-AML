#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = __importStar(require("path"));
const utils = __importStar(require("./utils"));
const package_json_1 = __importDefault(require("package-json"));
const commander_1 = __importDefault(require("commander"));
const semver_1 = __importDefault(require("semver"));
let versionCache = new Map();
const tags = /^([~^]?)([\w.]*)$/;
function getVersion(pkg, specifier) {
    return __awaiter(this, void 0, void 0, function* () {
        let key = JSON.stringify([pkg, specifier]);
        if (versionCache.has(key)) {
            return versionCache.get(key);
        }
        if (semver_1.default.validRange(specifier) === null) {
            // We have a tag, with possibly a range specifier, such as ^latest
            let match = specifier.match(tags);
            if (match === null) {
                throw Error(`Invalid version specifier: ${specifier}`);
            }
            // Look up the actual version corresponding to the tag
            let { version } = yield package_json_1.default(pkg, { version: match[2] });
            specifier = match[1] + version;
        }
        versionCache.set(key, specifier);
        return specifier;
    });
}
/**
 * A very simple subset comparator
 *
 * @returns true if we can determine if range1 is a subset of range2, otherwise false
 *
 * #### Notes
 * This will not be able to determine if range1 is a subset of range2 in many cases.
 */
function subset(range1, range2) {
    try {
        const [, r1, version1] = range1.match(tags);
        const [, r2] = range2.match(tags);
        return (['', '~', '^'].indexOf(r1) >= 0 &&
            r1 === r2 &&
            semver_1.default.valid(version1) &&
            semver_1.default.satisfies(version1, range2));
    }
    catch (e) {
        return false;
    }
}
function handleDependency(dependencies, dep, specifier, minimal) {
    return __awaiter(this, void 0, void 0, function* () {
        let log = [];
        let updated = false;
        let newRange = yield getVersion(dep, specifier);
        let oldRange = dependencies[dep];
        if (minimal && subset(newRange, oldRange)) {
            log.push(`SKIPPING ${dep} ${oldRange} -> ${newRange}`);
        }
        else {
            log.push(`${dep} ${oldRange} -> ${newRange}`);
            dependencies[dep] = newRange;
            updated = true;
        }
        return { updated, log };
    });
}
/**
 * Handle an individual package on the path - update the dependency.
 */
function handlePackage(name, specifier, packagePath, dryRun = false, minimal = false) {
    return __awaiter(this, void 0, void 0, function* () {
        let fileUpdated = false;
        let fileLog = [];
        // Read in the package.json.
        packagePath = path.join(packagePath, 'package.json');
        let data;
        try {
            data = utils.readJSONFile(packagePath);
        }
        catch (e) {
            console.log('Skipping package ' + packagePath);
            return;
        }
        // Update dependencies as appropriate.
        for (let dtype of ['dependencies', 'devDependencies']) {
            let deps = data[dtype] || {};
            if (typeof name === 'string') {
                let dep = name;
                if (dep in deps) {
                    let { updated, log } = yield handleDependency(deps, dep, specifier, minimal);
                    if (updated) {
                        fileUpdated = true;
                    }
                    fileLog.push(...log);
                }
            }
            else {
                let keys = Object.keys(deps);
                keys.sort();
                for (let dep of keys) {
                    if (dep.match(name)) {
                        let { updated, log } = yield handleDependency(deps, dep, specifier, minimal);
                        if (updated) {
                            fileUpdated = true;
                        }
                        fileLog.push(...log);
                    }
                }
            }
        }
        if (fileLog.length > 0) {
            console.log(packagePath);
            console.log(fileLog.join('\n'));
            console.log();
        }
        // Write the file back to disk.
        if (!dryRun && fileUpdated) {
            utils.writePackageData(packagePath, data);
        }
    });
}
commander_1.default
    .description('Update dependency versions')
    .usage('[options] <package> [versionspec], versionspec defaults to ^latest')
    .option('--dry-run', 'Do not perform actions, just print output')
    .option('--regex', 'Package is a regular expression')
    .option('--lerna', 'Update dependencies in all lerna packages')
    .option('--path [path]', 'Path to package or monorepo to update')
    .option('--minimal', 'only update if the change is substantial')
    .arguments('<package> [versionspec]')
    .action((name, version = '^latest', args) => __awaiter(this, void 0, void 0, function* () {
    let basePath = path.resolve(args.path || '.');
    let pkg = args.regex ? new RegExp(name) : name;
    if (args.lerna) {
        let paths = utils.getLernaPaths(basePath).sort();
        // We use a loop instead of Promise.all so that the output is in
        // alphabetical order.
        for (let pkgPath of paths) {
            yield handlePackage(pkg, version, pkgPath, args.dryRun, args.minimal);
        }
    }
    yield handlePackage(pkg, version, basePath, args.dryRun, args.minimal);
}));
commander_1.default.on('--help', function () {
    console.log(`
Examples
--------

  Update the package 'webpack' to a specific version range:

      update-dependency webpack ^4.0.0

  Update all packages to the latest version, with a caret.
  Only update if the update is substantial:

      update-dependency --minimal --regex '.*' ^latest

  Print the log of the above without actually making any changes.

  update-dependency --dry-run --minimal --regex '.*' ^latest

  Update all packages starting with '@jupyterlab/' to the version
  the 'latest' tag currently points to, with a caret range:

      update-dependency --regex '^@jupyterlab/' ^latest

  Update all packages starting with '@jupyterlab/' in all lerna
  workspaces and the root package.json to whatever version the 'next'
  tag for each package currently points to (with a caret tag).
  Update the version range only if the change is substantial.

      update-dependency --lerna --regex --minimal '^@jupyterlab/' ^next
`);
});
commander_1.default.parse(process.argv);
// If no arguments supplied
if (!process.argv.slice(2).length) {
    commander_1.default.outputHelp();
    process.exit(1);
}
