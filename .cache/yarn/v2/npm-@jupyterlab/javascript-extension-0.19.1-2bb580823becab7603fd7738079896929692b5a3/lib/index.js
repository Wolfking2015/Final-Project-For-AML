"use strict";
// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
Object.defineProperty(exports, "__esModule", { value: true });
const rendermime_1 = require("@jupyterlab/rendermime");
exports.TEXT_JAVASCRIPT_MIMETYPE = 'text/javascript';
exports.APPLICATION_JAVASCRIPT_MIMETYPE = 'application/javascript';
function evalInContext(code, element, document, window) {
    // tslint:disable-next-line
    return eval(code);
}
class ExperimentalRenderedJavascript extends rendermime_1.RenderedJavaScript {
    render(model) {
        const renderJavascript = () => {
            try {
                const data = model.data[this.mimeType];
                evalInContext(data, this.node, document, window);
                // If output is empty after evaluating, render the plain text value
                if (this.node.innerHTML === '') {
                    const text = model.data['text/plain'];
                    const output = document.createElement('pre');
                    output.textContent = text;
                    this.node.appendChild(output);
                }
                return Promise.resolve();
            }
            catch (error) {
                return Promise.reject(error);
            }
        };
        if (!model.trusted) {
            // If output is not trusted or if arbitrary Javascript execution is not enabled, render an informative error message
            this.node.innerHTML = `<pre>Are you sure that you want to run arbitrary Javascript within your JupyterLab session?</pre>
      <button>Run</button>`;
            this.node.querySelector('button').onclick = event => {
                this.node.innerHTML = '';
                renderJavascript();
            };
            return Promise.resolve();
        }
        return renderJavascript();
    }
}
exports.ExperimentalRenderedJavascript = ExperimentalRenderedJavascript;
/**
 * A mime renderer factory for text/javascript data.
 */
exports.rendererFactory = {
    safe: false,
    mimeTypes: [exports.TEXT_JAVASCRIPT_MIMETYPE, exports.APPLICATION_JAVASCRIPT_MIMETYPE],
    createRenderer: options => new ExperimentalRenderedJavascript(options)
};
const extension = {
    id: '@jupyterlab/javascript-extension:factory',
    rendererFactory: exports.rendererFactory,
    rank: 0,
    dataType: 'string'
};
exports.default = extension;
