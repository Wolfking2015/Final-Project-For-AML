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
const inquirer = __importStar(require("inquirer"));
const path = __importStar(require("path"));
const utils = __importStar(require("./utils"));
let questions = [
    {
        type: 'input',
        name: 'name',
        message: 'name: '
    },
    {
        type: 'input',
        name: 'description',
        message: 'description: '
    }
];
inquirer.prompt(questions).then(answers => {
    let { name, description } = answers;
    let dest = path.resolve(path.join('.', 'packages', name));
    if (fs.existsSync(dest)) {
        console.error('Package already exists: ', name);
        process.exit(1);
    }
    fs.copySync(path.resolve(path.join(__dirname, '..', 'template')), dest);
    let jsonPath = path.join(dest, 'package.json');
    let data = utils.readJSONFile(jsonPath);
    if (name.indexOf('@jupyterlab/') === -1) {
        name = '@jupyterlab/' + name;
    }
    data.name = name;
    data.description = description;
    utils.writePackageData(jsonPath, data);
    // Use npm here so this file can be used outside of JupyterLab.
    utils.run('npm run integrity');
});
