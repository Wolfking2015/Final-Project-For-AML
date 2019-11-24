"use strict";
// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
Object.defineProperty(exports, "__esModule", { value: true });
const coreutils_1 = require("@jupyterlab/coreutils");
/**
 * The default connector for making inspection requests from the Jupyter API.
 */
class KernelConnector extends coreutils_1.DataConnector {
    /**
     * Create a new kernel connector for inspection requests.
     *
     * @param options - The instatiation options for the kernel connector.
     */
    constructor(options) {
        super();
        this._session = options.session;
    }
    /**
     * Fetch inspection requests.
     *
     * @param request - The inspection request text and details.
     */
    fetch(request) {
        const kernel = this._session.kernel;
        if (!kernel) {
            return Promise.reject(new Error('Inspection fetch requires a kernel.'));
        }
        const contents = {
            code: request.text,
            cursor_pos: request.offset,
            detail_level: 0
        };
        return kernel.requestInspect(contents).then(msg => {
            const response = msg.content;
            if (response.status !== 'ok' || !response.found) {
                throw new Error('Inspection fetch failed to return successfully.');
            }
            return { data: response.data, metadata: response.metadata };
        });
    }
}
exports.KernelConnector = KernelConnector;
