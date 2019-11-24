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
Object.defineProperty(exports, "__esModule", { value: true });
const path = __importStar(require("path"));
const utils = __importStar(require("./utils"));
const packageJson = require("package-json");
let allDeps = [];
let allDevDeps = [];
/**
 * Get the appropriate dependency for a given package name.
 *
 * @param name - The name of the package.
 *
 * @returns The dependency version specifier.
 */
function getDependency(name) {
    return __awaiter(this, void 0, void 0, function* () {
        let version = '';
        let versions = {};
        allDeps = [];
        allDevDeps = [];
        utils.getLernaPaths().forEach(pkgRoot => {
            // Read in the package.json.
            let packagePath = path.join(pkgRoot, 'package.json');
            let data;
            try {
                data = utils.readJSONFile(packagePath);
            }
            catch (e) {
                return;
            }
            if (data.name === name) {
                version = '^' + data.version;
                return;
            }
            let deps = data.dependencies || {};
            let devDeps = data.devDependencies || {};
            if (deps[name]) {
                allDeps.push(data.name);
                if (deps[name] in versions) {
                    versions[deps[name]]++;
                }
                else {
                    versions[deps[name]] = 1;
                }
            }
            if (devDeps[name]) {
                allDevDeps.push(data.name);
                if (devDeps[name] in versions) {
                    versions[devDeps[name]]++;
                }
                else {
                    versions[devDeps[name]] = 1;
                }
            }
        });
        if (version) {
            return version;
        }
        if (Object.keys(versions).length > 0) {
            // Get the most common version.
            version = Object.keys(versions).reduce((a, b) => {
                return versions[a] > versions[b] ? a : b;
            });
        }
        else {
            const releaseData = yield packageJson(name);
            version = '~' + releaseData.version;
        }
        return Promise.resolve(version);
    });
}
exports.getDependency = getDependency;
if (require.main === module) {
    // Make sure we have required command line arguments.
    if (process.argv.length < 3) {
        let msg = '** Must supply a target library name\n';
        process.stderr.write(msg);
        process.exit(1);
    }
    let name = process.argv[2];
    getDependency(name).then(version => {
        console.log('dependency of: ', allDeps);
        console.log('devDependency of:', allDevDeps);
        console.log(`\n    "${name}": "${version}"`);
    });
}
