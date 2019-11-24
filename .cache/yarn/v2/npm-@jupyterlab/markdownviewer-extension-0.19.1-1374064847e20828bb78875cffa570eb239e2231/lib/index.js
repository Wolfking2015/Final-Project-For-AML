"use strict";
// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
Object.defineProperty(exports, "__esModule", { value: true });
const rendermime_1 = require("@jupyterlab/rendermime");
require("../style/index.css");
/**
 * The name of the factory that creates markdown widgets.
 */
const FACTORY = 'Markdown Preview';
/**
 * The markdown mime renderer extension.
 */
const extension = {
    id: '@jupyterlab/markdownviewer-extension:factory',
    rendererFactory: rendermime_1.markdownRendererFactory,
    dataType: 'string',
    documentWidgetFactoryOptions: {
        name: FACTORY,
        primaryFileType: 'markdown',
        fileTypes: ['markdown'],
        defaultRendered: ['markdown']
    }
};
/**
 * Export the extension as default.
 */
exports.default = extension;
