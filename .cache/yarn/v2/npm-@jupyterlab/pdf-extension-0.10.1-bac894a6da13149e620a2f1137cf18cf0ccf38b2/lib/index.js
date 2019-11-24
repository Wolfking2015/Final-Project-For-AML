"use strict";
// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
Object.defineProperty(exports, "__esModule", { value: true });
const widgets_1 = require("@phosphor/widgets");
require("../style/index.css");
/**
 * The MIME type for PDF.
 */
exports.MIME_TYPE = 'application/pdf';
exports.PDF_CLASS = 'jp-PDFViewer';
exports.PDF_CONTAINER_CLASS = 'jp-PDFContainer';
/**
 * A class for rendering a PDF document.
 */
class RenderedPDF extends widgets_1.Widget {
    constructor() {
        super({ node: Private.createNode() });
        this._objectUrl = '';
    }
    /**
     * Render PDF into this widget's node.
     */
    renderModel(model) {
        let data = model.data[exports.MIME_TYPE];
        // If there is no data, do nothing.
        if (!data) {
            return Promise.resolve(void 0);
        }
        const blob = Private.b64toBlob(data, exports.MIME_TYPE);
        let oldUrl = this._objectUrl;
        this._objectUrl = URL.createObjectURL(blob);
        this.node.querySelector('embed').setAttribute('src', this._objectUrl);
        // Release reference to any previous object url.
        if (oldUrl) {
            try {
                URL.revokeObjectURL(oldUrl);
            }
            catch (error) {
                /* no-op */
            }
        }
        return Promise.resolve(void 0);
    }
    /**
     * Dispose of the resources held by the pdf widget.
     */
    dispose() {
        try {
            URL.revokeObjectURL(this._objectUrl);
        }
        catch (error) {
            /* no-op */
        }
        super.dispose();
    }
}
exports.RenderedPDF = RenderedPDF;
/**
 * A mime renderer factory for PDF data.
 */
exports.rendererFactory = {
    safe: false,
    mimeTypes: [exports.MIME_TYPE],
    defaultRank: 75,
    createRenderer: options => new RenderedPDF()
};
const extensions = [
    {
        id: '@jupyterlab/pdf-extension:factory',
        rendererFactory: exports.rendererFactory,
        dataType: 'string',
        fileTypes: [
            {
                name: 'PDF',
                displayName: 'PDF',
                fileFormat: 'base64',
                mimeTypes: [exports.MIME_TYPE],
                extensions: ['.pdf']
            }
        ],
        documentWidgetFactoryOptions: {
            name: 'PDF',
            modelName: 'base64',
            primaryFileType: 'PDF',
            fileTypes: ['PDF'],
            defaultFor: ['PDF']
        }
    }
];
exports.default = extensions;
/**
 * A namespace for PDF widget private data.
 */
var Private;
(function (Private) {
    /**
     * Create the node for the PDF widget.
     */
    function createNode() {
        let node = document.createElement('div');
        node.className = exports.PDF_CONTAINER_CLASS;
        let pdf = document.createElement('embed');
        pdf.className = exports.PDF_CLASS;
        pdf.setAttribute('type', exports.MIME_TYPE);
        node.appendChild(pdf);
        return node;
    }
    Private.createNode = createNode;
    /**
     * Convert a base64 encoded string to a Blob object.
     * Modified from a snippet found here:
     * https://stackoverflow.com/questions/16245767/creating-a-blob-from-a-base64-string-in-javascript
     *
     * @param b64Data - The base64 encoded data.
     *
     * @param contentType - The mime type of the data.
     *
     * @param sliceSize - The size to chunk the data into for processing.
     *
     * @returns a Blob for the data.
     */
    function b64toBlob(b64Data, contentType = '', sliceSize = 512) {
        const byteCharacters = atob(b64Data);
        let byteArrays = [];
        for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            let slice = byteCharacters.slice(offset, offset + sliceSize);
            let byteNumbers = new Array(slice.length);
            for (let i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }
            let byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
        }
        return new Blob(byteArrays, { type: contentType });
    }
    Private.b64toBlob = b64toBlob;
})(Private || (Private = {}));
