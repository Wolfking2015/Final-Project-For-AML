"use strict";
// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
Object.defineProperty(exports, "__esModule", { value: true });
const coreutils_1 = require("@jupyterlab/coreutils");
/**
 * A kernel connector for completion handlers.
 */
class KernelConnector extends coreutils_1.DataConnector {
    /**
     * Create a new kernel connector for completion requests.
     *
     * @param options - The instatiation options for the kernel connector.
     */
    constructor(options) {
        super();
        this._session = options.session;
    }
    /**
     * Fetch completion requests.
     *
     * @param request - The completion request text and details.
     */
    fetch(request) {
        const kernel = this._session.kernel;
        if (!kernel) {
            return Promise.reject(new Error('No kernel for completion request.'));
        }
        const contents = {
            code: request.text,
            cursor_pos: request.offset
        };
        return kernel.requestComplete(contents).then(msg => {
            const response = msg.content;
            if (response.status !== 'ok') {
                throw new Error('Completion fetch failed to return successfully.');
            }
            return {
                start: response.cursor_start,
                end: response.cursor_end,
                matches: response.matches,
                metadata: response.metadata
            };
        });
    }
}
exports.KernelConnector = KernelConnector;
