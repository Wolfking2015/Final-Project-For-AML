"use strict";
// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
Object.defineProperty(exports, "__esModule", { value: true });
const coreutils_1 = require("@jupyterlab/coreutils");
const kernelconnector_1 = require("./kernelconnector");
const contextconnector_1 = require("./contextconnector");
/**
 * A context+kernel connector for completion handlers.
 */
class CompletionConnector extends coreutils_1.DataConnector {
    /**
     * Create a new connector for completion requests.
     *
     * @param options - The instatiation options for the connector.
     */
    constructor(options) {
        super();
        this._kernel = new kernelconnector_1.KernelConnector(options);
        this._context = new contextconnector_1.ContextConnector(options);
    }
    /**
     * Fetch completion requests.
     *
     * @param request - The completion request text and details.
     */
    fetch(request) {
        return Promise.all([
            this._kernel.fetch(request),
            this._context.fetch(request)
        ]).then(([kernelReply, contextReply]) => {
            return Private.mergeReplies(kernelReply, contextReply);
        });
    }
}
exports.CompletionConnector = CompletionConnector;
/**
 * A namespace for private functionality.
 */
var Private;
(function (Private) {
    /**
     * Merge results from kernel and context completions.
     */
    function mergeReplies(kernel, context) {
        // If one is empty, return the other.
        if (kernel.matches.length === 0) {
            return context;
        }
        else if (context.matches.length === 0) {
            return kernel;
        }
        // They both have matches, so merge them, with a preference for the
        // kernel result.
        let matches = kernel.matches.slice();
        context.matches.forEach(match => {
            if (matches.indexOf(match) === -1) {
                matches.push(match);
            }
        });
        return Object.assign({}, kernel, { matches });
    }
    Private.mergeReplies = mergeReplies;
})(Private || (Private = {}));
