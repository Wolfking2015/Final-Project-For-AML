"use strict";
// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
Object.defineProperty(exports, "__esModule", { value: true });
const apputils_1 = require("@jupyterlab/apputils");
/**
 * A plugin for the Jupyter Dark Theme.
 */
const plugin = {
    id: '@jupyterlab/theme-dark-extension:plugin',
    requires: [apputils_1.IThemeManager],
    activate: (app, manager) => {
        const style = '@jupyterlab/theme-dark-extension/index.css';
        manager.register({
            name: 'JupyterLab Dark',
            isLight: false,
            load: () => manager.loadCSS(style),
            unload: () => Promise.resolve(undefined)
        });
    },
    autoStart: true
};
exports.default = plugin;
