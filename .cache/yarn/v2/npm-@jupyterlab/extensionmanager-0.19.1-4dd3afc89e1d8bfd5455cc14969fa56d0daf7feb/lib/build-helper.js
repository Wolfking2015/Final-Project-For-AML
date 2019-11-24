"use strict";
// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const apputils_1 = require("@jupyterlab/apputils");
const React = __importStar(require("react"));
/**
 * Instruct the server to perform a build
 *
 * @param builder the build manager
 */
function doBuild(builder) {
    if (builder.isAvailable) {
        return builder
            .build()
            .then(() => {
            return apputils_1.showDialog({
                title: 'Build Complete',
                body: 'Build successfully completed, reload page?',
                buttons: [
                    apputils_1.Dialog.cancelButton(),
                    apputils_1.Dialog.warnButton({ label: 'RELOAD' })
                ]
            });
        })
            .then(result => {
            if (result.button.accept) {
                location.reload();
            }
        })
            .catch(err => {
            apputils_1.showDialog({
                title: 'Build Failed',
                body: React.createElement("pre", null, err.message)
            });
        });
    }
    return Promise.resolve();
}
exports.doBuild = doBuild;
