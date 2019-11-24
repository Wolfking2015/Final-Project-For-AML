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
 * Show a dialog box reporting an error during installation of an extension.
 *
 * @param name The name of the extension
 * @param errorMessage Any error message giving details about the failure.
 */
function reportInstallError(name, errorMessage) {
    let entries = [];
    entries.push(React.createElement("p", null,
        "An error occurred installing ",
        React.createElement("code", null, name),
        "."));
    if (errorMessage) {
        entries.push(React.createElement("p", null,
            React.createElement("span", { className: "jp-extensionmanager-dialog-subheader" }, "Error message:")), React.createElement("pre", null, errorMessage.trim()));
    }
    let body = React.createElement("div", { className: "jp-extensionmanager-dialog" }, entries);
    apputils_1.showDialog({
        title: 'Extension Installation Error',
        body,
        buttons: [apputils_1.Dialog.warnButton({ label: 'OK' })]
    });
}
exports.reportInstallError = reportInstallError;
