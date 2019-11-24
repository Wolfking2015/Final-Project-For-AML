"use strict";
// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
const coreutils_1 = require("@phosphor/coreutils");
require("../style/index.css");
__export(require("./handler"));
__export(require("./kernelconnector"));
__export(require("./contextconnector"));
__export(require("./connector"));
__export(require("./model"));
__export(require("./widget"));
/* tslint:disable */
/**
 * The completion manager token.
 */
exports.ICompletionManager = new coreutils_1.Token('@jupyterlab/completer:ICompletionManager');
