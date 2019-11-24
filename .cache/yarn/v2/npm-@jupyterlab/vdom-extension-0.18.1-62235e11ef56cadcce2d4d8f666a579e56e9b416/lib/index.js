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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const widgets_1 = require("@phosphor/widgets");
const React = __importStar(require("react"));
const ReactDOM = __importStar(require("react-dom"));
const transform_vdom_1 = __importDefault(require("@nteract/transform-vdom"));
require("../style/index.css");
/**
 * The CSS class to add to the VDOM Widget.
 */
const CSS_CLASS = 'jp-RenderedVDOM';
/**
 * The CSS class for a VDOM icon.
 */
const CSS_ICON_CLASS = 'jp-MaterialIcon jp-VDOMIcon';
/**
 * The MIME type for VDOM.
 */
exports.MIME_TYPE = 'application/vdom.v1+json';
/**
 * A renderer for declarative virtual DOM content.
 */
class RenderedVDOM extends widgets_1.Widget {
    /**
     * Create a new widget for rendering DOM.
     */
    constructor(options) {
        super();
        this.addClass(CSS_CLASS);
        this._mimeType = options.mimeType;
    }
    /**
     * Render VDOM into this widget's node.
     */
    renderModel(model) {
        const data = model.data[this._mimeType];
        // const metadata = model.metadata[this._mimeType] as any || {};
        return new Promise((resolve, reject) => {
            ReactDOM.render(React.createElement(transform_vdom_1.default, { data: data }), this.node, () => {
                resolve(undefined);
            });
        });
    }
}
exports.RenderedVDOM = RenderedVDOM;
/**
 * A mime renderer factory for VDOM data.
 */
exports.rendererFactory = {
    safe: true,
    mimeTypes: [exports.MIME_TYPE],
    createRenderer: options => new RenderedVDOM(options)
};
const extensions = [
    {
        id: '@jupyterlab/vdom-extension:factory',
        rendererFactory: exports.rendererFactory,
        rank: 0,
        dataType: 'json',
        fileTypes: [
            {
                name: 'vdom',
                mimeTypes: [exports.MIME_TYPE],
                extensions: ['.vdom', '.vdom.json'],
                iconClass: CSS_ICON_CLASS
            }
        ],
        documentWidgetFactoryOptions: {
            name: 'VDOM',
            primaryFileType: 'vdom',
            fileTypes: ['vdom', 'json'],
            defaultFor: ['vdom']
        }
    }
];
exports.default = extensions;
