"use strict";
/*-----------------------------------------------------------------------------
| Copyright (c) Jupyter Development Team.
| Distributed under the terms of the Modified BSD License.
|----------------------------------------------------------------------------*/
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const widgets_1 = require("@phosphor/widgets");
require("../style/index.css");
/**
 * The CSS class to add to the Vega and Vega-Lite widget.
 */
const VEGA_COMMON_CLASS = 'jp-RenderedVegaCommon4';
/**
 * The CSS class to add to the Vega.
 */
const VEGA_CLASS = 'jp-RenderedVega4';
/**
 * The CSS class to add to the Vega-Lite.
 */
const VEGALITE_CLASS = 'jp-RenderedVegaLite2';
/**
 * The MIME type for Vega.
 *
 * #### Notes
 * The version of this follows the major version of Vega.
 */
exports.VEGA_MIME_TYPE = 'application/vnd.vega.v4+json';
/**
 * The MIME type for Vega-Lite.
 *
 * #### Notes
 * The version of this follows the major version of Vega-Lite.
 */
exports.VEGALITE_MIME_TYPE = 'application/vnd.vegalite.v2+json';
/**
 * A widget for rendering Vega or Vega-Lite data, for usage with rendermime.
 */
class RenderedVega extends widgets_1.Widget {
    /**
     * Create a new widget for rendering Vega/Vega-Lite.
     */
    constructor(options) {
        super();
        this._mimeType = options.mimeType;
        this._resolver = options.resolver;
        this.addClass(VEGA_COMMON_CLASS);
        this.addClass(this._mimeType === exports.VEGA_MIME_TYPE ? VEGA_CLASS : VEGALITE_CLASS);
    }
    /**
     * Render Vega/Vega-Lite into this widget's node.
     */
    renderModel(model) {
        return __awaiter(this, void 0, void 0, function* () {
            const spec = model.data[this._mimeType];
            const metadata = model.metadata[this._mimeType];
            const embedOptions = metadata && metadata.embed_options ? metadata.embed_options : {};
            const mode = this._mimeType === exports.VEGA_MIME_TYPE ? 'vega' : 'vega-lite';
            const vega = Private.vega != null ? Private.vega : yield Private.ensureVega();
            const path = yield this._resolver.resolveUrl('');
            const baseURL = yield this._resolver.getDownloadUrl(path);
            const el = document.createElement('div');
            // clear the output before attaching a chart
            this.node.innerHTML = '';
            this.node.appendChild(el);
            this._result = yield vega.default(el, spec, Object.assign({ actions: true, defaultStyle: true }, embedOptions, { mode, loader: {
                    baseURL,
                    http: { credentials: 'same-origin' }
                } }));
            if (model.data['image/png']) {
                return;
            }
            // Add png representation of vega chart to output
            const imageURL = yield this._result.view.toImageURL('png');
            model.setData({
                data: Object.assign({}, model.data, { 'image/png': imageURL.split(',')[1] })
            });
        });
    }
    dispose() {
        if (this._result) {
            this._result.view.finalize();
        }
        super.dispose();
    }
}
exports.RenderedVega = RenderedVega;
/**
 * A mime renderer factory for vega data.
 */
exports.rendererFactory = {
    safe: true,
    mimeTypes: [exports.VEGA_MIME_TYPE, exports.VEGALITE_MIME_TYPE],
    createRenderer: options => new RenderedVega(options)
};
const extension = {
    id: '@jupyterlab/vega-extension:factory',
    rendererFactory: exports.rendererFactory,
    rank: 50,
    dataType: 'json',
    documentWidgetFactoryOptions: [
        {
            name: 'Vega',
            primaryFileType: 'vega4',
            fileTypes: ['vega4', 'json'],
            defaultFor: ['vega4']
        },
        {
            name: 'Vega-Lite',
            primaryFileType: 'vega-lite2',
            fileTypes: ['vega-lite2', 'json'],
            defaultFor: ['vega-lite2']
        }
    ],
    fileTypes: [
        {
            mimeTypes: [exports.VEGA_MIME_TYPE],
            name: 'vega4',
            extensions: ['.vg', '.vg.json', '.vega'],
            iconClass: 'jp-MaterialIcon jp-VegaIcon'
        },
        {
            mimeTypes: [exports.VEGALITE_MIME_TYPE],
            name: 'vega-lite2',
            extensions: ['.vl', '.vl.json', '.vegalite'],
            iconClass: 'jp-MaterialIcon jp-VegaIcon'
        }
    ]
};
exports.default = extension;
/**
 * A namespace for private module data.
 */
var Private;
(function (Private) {
    /**
     * Lazy-load and cache the vega-embed library
     */
    function ensureVega() {
        if (Private.vegaReady) {
            return Private.vegaReady;
        }
        Private.vegaReady = new Promise((resolve, reject) => {
            require.ensure(['vega-embed'], 
            // see https://webpack.js.org/api/module-methods/#require-ensure
            // this argument MUST be named `require` for the WebPack parser
            require => {
                Private.vega = require('vega-embed');
                resolve(Private.vega);
            }, (error) => {
                console.error(error);
                reject();
            }, 'vega');
        });
        return Private.vegaReady;
    }
    Private.ensureVega = ensureVega;
})(Private || (Private = {}));
