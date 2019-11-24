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
 * Prompt the user what do about companion packages, if present.
 *
 * @param builder the build manager
 */
function presentCompanions(kernelCompanions, serverCompanion) {
    let entries = [];
    if (serverCompanion) {
        entries.push(React.createElement("p", null,
            "This package has indicated that it needs a corresponding server extension:",
            React.createElement("code", null,
                " ",
                serverCompanion.base.name)));
    }
    if (kernelCompanions.length > 0) {
        entries.push(React.createElement("p", null, "This package has indicated that it needs a corresponding package for the kernel."));
        for (let entry of kernelCompanions) {
            entries.push(React.createElement("p", null,
                "The package",
                React.createElement("code", null, entry.kernelInfo.base.name),
                ", is required by the following kernels:"));
            let kernelEntries = [];
            for (let kernel of entry.kernels) {
                kernelEntries.push(React.createElement("li", null,
                    React.createElement("code", null, kernel.display_name)));
            }
            entries.push(React.createElement("ul", null, kernelEntries));
        }
    }
    let body = (React.createElement("div", null,
        entries,
        React.createElement("p", null, "You should make sure that the indicated packages are installed before trying to use the extension. Do you want to continue with the extension installation?")));
    return apputils_1.showDialog({
        title: 'Kernel companions',
        body,
        buttons: [
            apputils_1.Dialog.cancelButton(),
            apputils_1.Dialog.okButton({
                label: 'OK',
                caption: 'Install the Jupyterlab extension.'
            })
        ]
    }).then(result => {
        return result.button.accept;
    });
}
exports.presentCompanions = presentCompanions;
