"use strict";
/*-----------------------------------------------------------------------------
| Copyright (c) Jupyter Development Team.
| Distributed under the terms of the Modified BSD License.
|----------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const coreutils_1 = require("@jupyterlab/coreutils");
const rendermime_1 = require("@jupyterlab/rendermime");
const mathjax2_1 = require("@jupyterlab/mathjax2");
/**
 * The MathJax latexTypesetter plugin.
 */
const plugin = {
    id: '@jupyterlab/mathjax2-extension:plugin',
    autoStart: true,
    provides: rendermime_1.ILatexTypesetter,
    activate: () => {
        let url = coreutils_1.PageConfig.getOption('mathjaxUrl');
        let config = coreutils_1.PageConfig.getOption('mathjaxConfig');
        return new mathjax2_1.MathJaxTypesetter({ url, config });
    }
};
/**
 * Export the plugin as default.
 */
exports.default = plugin;
