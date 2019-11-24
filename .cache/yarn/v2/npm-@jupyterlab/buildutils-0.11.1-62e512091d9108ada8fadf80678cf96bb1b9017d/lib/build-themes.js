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
// Webpack all of the packages that have a theme dir.
utils.getCorePaths().forEach(pkgPath => {
    const target = path.join(pkgPath, 'package.json');
    if (!fs.existsSync(target)) {
        return;
    }
    const data = require(target);
    if (!data.jupyterlab) {
        return;
    }
    const themeDir = data.jupyterlab.themeDir;
    if (!themeDir) {
        return;
    }
    if (!data.scripts['build:webpack']) {
        return;
    }
    utils.run('jlpm run build:webpack', { cwd: pkgPath });
});
