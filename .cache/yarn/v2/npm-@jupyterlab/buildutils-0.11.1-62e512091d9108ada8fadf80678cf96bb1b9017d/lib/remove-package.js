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
/**
 * Remove an extension from the relevant metadata
 * files of the JupyterLab source tree so that it
 * is not included in the build. Intended for testing
 * adding/removing extensions against development
 * branches of JupyterLab.
 */
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const utils = __importStar(require("./utils"));
// Make sure we have required command line arguments.
if (process.argv.length < 3) {
    let msg = '** Must supply a target extension name';
    process.stderr.write(msg);
    process.exit(1);
}
// Get the package name or path.
let target = process.argv[2];
let basePath = path.resolve('.');
// Get the package.json of the extension.
let packagePath = path.join(basePath, 'packages', target, 'package.json');
if (!fs.existsSync(packagePath)) {
    packagePath = require.resolve(path.join(target, 'package.json'));
}
// Remove the package from the local tree.
fs.removeSync(path.dirname(packagePath));
// Update the core jupyterlab build dependencies.
utils.run('npm run integrity');
