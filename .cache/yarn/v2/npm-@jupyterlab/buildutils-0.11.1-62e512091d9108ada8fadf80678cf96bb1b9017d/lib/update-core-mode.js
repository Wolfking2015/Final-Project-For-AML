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
const utils = __importStar(require("./utils"));
// Get the dev mode package.json file.
let data = utils.readJSONFile('./dev_mode/package.json');
// Update the values that need to change and write to staging.
data['jupyterlab']['buildDir'] = './build';
data['jupyterlab']['outputDir'] = '..';
data['jupyterlab']['staticDir'] = '../static';
data['jupyterlab']['linkedPackages'] = {};
let staging = './jupyterlab/staging';
utils.writePackageData(path.join(staging, 'package.json'), data);
// Update our staging files.
[
    'index.js',
    'webpack.config.js',
    'webpack.prod.config.js',
    'templates'
].forEach(name => {
    fs.copySync(path.join('.', 'dev_mode', name), path.join('.', 'jupyterlab', 'staging', name));
});
// Create a new yarn.lock file to ensure it is correct.
fs.removeSync(path.join(staging, 'yarn.lock'));
utils.run('jlpm', { cwd: staging });
// Build the core assets.
utils.run('jlpm run build:prod', { cwd: staging });
