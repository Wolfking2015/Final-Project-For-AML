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
const widgets_1 = require("@phosphor/widgets");
const React = __importStar(require("react"));
const ReactDOM = __importStar(require("react-dom"));
const component_1 = require("./component");
require("../style/index.css");
/**
 * The CSS class to add to the JSON Widget.
 */
const CSS_CLASS = 'jp-RenderedJSON';
/**
 * The MIME type for JSON.
 */
exports.MIME_TYPE = 'application/json';
/**
 * A renderer for JSON data.
 */
class RenderedJSON extends widgets_1.Widget {
    /**
     * Create a new widget for rendering JSON.
     */
    constructor(options) {
        super();
        this.addClass(CSS_CLASS);
        this._mimeType = options.mimeType;
    }
    /**
     * Render JSON into this widget's node.
     */
    renderModel(model) {
        const data = model.data[this._mimeType];
        const metadata = model.metadata[this._mimeType] || {};
        const props = { data, metadata, theme: 'cm-s-jupyter' };
        return new Promise((resolve, reject) => {
            const component = React.createElement(component_1.Component, Object.assign({}, props));
            ReactDOM.render(component, this.node, () => {
                resolve();
            });
        });
    }
}
exports.RenderedJSON = RenderedJSON;
/**
 * A mime renderer factory for JSON data.
 */
exports.rendererFactory = {
    safe: true,
    mimeTypes: [exports.MIME_TYPE],
    createRenderer: options => new RenderedJSON(options)
};
const extensions = [
    {
        id: '@jupyterlab/json-extension:factory',
        rendererFactory: exports.rendererFactory,
        rank: 0,
        dataType: 'json',
        documentWidgetFactoryOptions: {
            name: 'JSON',
            primaryFileType: 'json',
            fileTypes: ['json', 'notebook'],
            defaultFor: ['json']
        }
    }
];
exports.default = extensions;
