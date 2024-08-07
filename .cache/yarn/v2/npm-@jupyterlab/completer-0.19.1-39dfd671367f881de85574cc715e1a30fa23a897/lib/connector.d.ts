import { DataConnector } from '@jupyterlab/coreutils';
import { KernelConnector } from './kernelconnector';
import { ContextConnector } from './contextconnector';
import { CompletionHandler } from './handler';
/**
 * A context+kernel connector for completion handlers.
 */
export declare class CompletionConnector extends DataConnector<CompletionHandler.IReply, void, CompletionHandler.IRequest> {
    /**
     * Create a new connector for completion requests.
     *
     * @param options - The instatiation options for the connector.
     */
    constructor(options: CompletionConnector.IOptions);
    /**
     * Fetch completion requests.
     *
     * @param request - The completion request text and details.
     */
    fetch(request: CompletionHandler.IRequest): Promise<CompletionHandler.IReply>;
    private _kernel;
    private _context;
}
/**
 * A namespace for completion connector statics.
 */
export declare namespace CompletionConnector {
    /**
     * The instantiation options for cell completion handlers.
     */
    type IOptions = KernelConnector.IOptions & ContextConnector.IOptions;
}
