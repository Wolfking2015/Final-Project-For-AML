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
const glob = __importStar(require("glob"));
const path = __importStar(require("path"));
const utils = __importStar(require("./utils"));
/**
 *  A namespace for JupyterLab build utilities.
 */
var Build;
(function (Build) {
    /**
     * Ensures that the assets of plugin packages are populated for a build.
     */
    function ensureAssets(options) {
        let { output, packageNames } = options;
        packageNames.forEach(function (name) {
            const packageDataPath = require.resolve(path.join(name, 'package.json'));
            const packageDir = path.dirname(packageDataPath);
            const packageData = utils.readJSONFile(packageDataPath);
            const extension = normalizeExtension(packageData);
            const { schemaDir, themeDir } = extension;
            // Handle schemas.
            if (schemaDir) {
                const schemas = glob.sync(path.join(path.join(packageDir, schemaDir), '*'));
                const destination = path.join(output, 'schemas', name);
                // Remove the existing directory if necessary.
                if (fs.existsSync(destination)) {
                    try {
                        const oldPackagePath = path.join(destination, 'package.json.orig');
                        const oldPackageData = utils.readJSONFile(oldPackagePath);
                        if (oldPackageData.version === packageData.version) {
                            fs.removeSync(destination);
                        }
                    }
                    catch (e) {
                        fs.removeSync(destination);
                    }
                }
                // Make sure the schema directory exists.
                fs.mkdirpSync(destination);
                // Copy schemas.
                schemas.forEach(schema => {
                    const file = path.basename(schema);
                    fs.copySync(schema, path.join(destination, file));
                });
                // Write the package.json file for future comparison.
                fs.copySync(path.join(packageDir, 'package.json'), path.join(destination, 'package.json.orig'));
            }
            // Handle themes.
            if (themeDir) {
                const from = path.join(packageDir, themeDir);
                const destination = path.join(output, 'themes', name);
                // Remove the existing directory if necessary.
                if (fs.existsSync(destination)) {
                    try {
                        const oldPackageData = utils.readJSONFile(path.join(destination, 'package.json.orig'));
                        if (oldPackageData.version === packageData.version) {
                            fs.removeSync(destination);
                        }
                    }
                    catch (e) {
                        fs.removeSync(destination);
                    }
                }
                // Make sure the theme directory exists.
                fs.mkdirpSync(destination);
                // Copy the theme folder.
                fs.copySync(from, destination);
                // Write the package.json file for future comparison.
                fs.copySync(path.join(packageDir, 'package.json'), path.join(destination, 'package.json.orig'));
            }
        });
    }
    Build.ensureAssets = ensureAssets;
    /**
     * Returns JupyterLab extension metadata from a module.
     */
    function normalizeExtension(module) {
        let { jupyterlab, main, name } = module;
        main = main || 'index.js';
        if (!jupyterlab) {
            throw new Error(`Module ${name} does not contain JupyterLab metadata.`);
        }
        let { extension, mimeExtension, schemaDir, themeDir } = jupyterlab;
        extension = extension === true ? main : extension;
        mimeExtension = mimeExtension === true ? main : mimeExtension;
        if (extension && mimeExtension && extension === mimeExtension) {
            const message = 'extension and mimeExtension cannot be the same export.';
            throw new Error(message);
        }
        return { extension, mimeExtension, schemaDir, themeDir };
    }
    Build.normalizeExtension = normalizeExtension;
})(Build = exports.Build || (exports.Build = {}));
