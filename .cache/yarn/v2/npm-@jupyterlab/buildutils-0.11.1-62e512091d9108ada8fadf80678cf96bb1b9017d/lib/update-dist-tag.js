"use strict";
/*-----------------------------------------------------------------------------
| Copyright (c) Jupyter Development Team.
| Distributed under the terms of the Modified BSD License.
|----------------------------------------------------------------------------*/
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
/**
 * Handle an individual package on the path - update the dependency.
 */
function handlePackage(packagePath) {
    return __awaiter(this, void 0, void 0, function* () {
        const cmds = [];
        // Read in the package.json.
        packagePath = path.join(packagePath, 'package.json');
        let data;
        try {
            data = utils.readJSONFile(packagePath);
        }
        catch (e) {
            console.log('Skipping package ' + packagePath);
            return cmds;
        }
        if (data.private) {
            return cmds;
        }
        const pkg = data.name;
        let npmData = yield package_json_1.default(pkg, { allVersions: true });
        let versions = Object.keys(npmData.versions).sort(semver_1.default.rcompare);
        let tags = npmData['dist-tags'];
        // Go through the versions. The latest prerelease is 'next', the latest
        // non-prerelease should be 'stable'.
        let next = semver_1.default.prerelease(versions[0]) ? versions[0] : undefined;
        let latest = versions.find(i => !semver_1.default.prerelease(i));
        if (latest && latest !== tags.latest) {
            cmds.push(`npm dist-tag add ${pkg}@${latest} latest`);
        }
        // If next is defined, but not supposed to be, remove it. If next is supposed
        // to be defined, but is not the same as the current next, change it.
        if (!next && tags.next) {
            cmds.push(`npm dist-tag rm ${pkg} next`);
        }
        else if (next && next !== tags.next) {
            cmds.push(`npm dist-tag add ${pkg}@${next} next`);
        }
        return cmds;
    });
}
function flatten(a) {
    return a.reduce((acc, val) => acc.concat(val), []);
}
commander_1.default
    .description(`Print out commands to update npm 'latest' and 'next' dist-tags
so that 'latest' points to the latest stable release and 'next'
points to the latest prerelease after it.`)
    .option('--lerna', 'Update dist-tags in all lerna packages')
    .option('--path [path]', 'Path to package or monorepo to update')
    .action((args) => __awaiter(this, void 0, void 0, function* () {
    let basePath = path.resolve(args.path || '.');
    let cmds = [];
    let paths = [];
    if (args.lerna) {
        paths = utils.getLernaPaths(basePath).sort();
        cmds = yield Promise.all(paths.map(handlePackage));
    }
    cmds.push(yield handlePackage(basePath));
    let out = flatten(cmds).join('\n');
    if (out) {
        console.log(out);
    }
}));
commander_1.default.parse(process.argv);
