"use strict";
/*-----------------------------------------------------------------------------
| Copyright (c) Jupyter Development Team.
| Distributed under the terms of the Modified BSD License.
|----------------------------------------------------------------------------*/
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const glob = __importStar(require("glob"));
const utils_1 = require("./utils");
// Get all of the packages.
let basePath = path.resolve('.');
let baseConfig = utils_1.readJSONFile(path.join(basePath, 'package.json'));
let packageConfig = baseConfig.workspaces;
let skipSource = process.argv.indexOf('packages') === -1;
let skipExamples = process.argv.indexOf('examples') === -1;
// Handle the packages
for (let i = 0; i < packageConfig.length; i++) {
    if (skipSource && packageConfig[i] === 'packages/*') {
        continue;
    }
    if (skipExamples && packageConfig[i] === 'examples/*') {
        continue;
    }
    let files = glob.sync(path.join(basePath, packageConfig[i]));
    for (let j = 0; j < files.length; j++) {
        try {
            handlePackage(files[j]);
        }
        catch (e) {
            console.error(e);
        }
    }
}
/**
 * Handle an individual package on the path - update the dependency.
 */
function handlePackage(packagePath) {
    // Read in the package.json.
    let packageJSONPath = path.join(packagePath, 'package.json');
    let data;
    try {
        data = require(packageJSONPath);
    }
    catch (e) {
        console.log('skipping', packagePath);
        return;
    }
    if (!data.scripts || !data.scripts.clean) {
        return;
    }
    let targets = data.scripts.clean.split('&&');
    for (let i = 0; i < targets.length; i++) {
        let target = targets[i].replace('rimraf', '').trim();
        target = path.join(packagePath, target);
        if (fs.existsSync(target)) {
            fs.removeSync(target);
        }
    }
}
