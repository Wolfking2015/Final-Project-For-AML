#!/usr/bin/env node
"use strict";
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
// Make sure we have required command line arguments.
if (process.argv.length !== 3) {
    let msg = '** Must supply a library name\n';
    process.stderr.write(msg);
    process.exit(1);
}
let name = process.argv[2];
// Handle the packages
utils.getLernaPaths().forEach(pkgPath => {
    handlePackage(pkgPath);
});
handlePackage(path.resolve('.'));
/**
 * Handle an individual package on the path - update the dependency.
 */
function handlePackage(packagePath) {
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
        delete deps[name];
    }
    // Write the file back to disk.
    utils.writePackageData(packagePath, data);
}
// Update the core jupyterlab build dependencies.
utils.run('jlpm run integrity');
