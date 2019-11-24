import { IClientSession } from '@jupyterlab/apputils';
import { DataConnector } from '@jupyterlab/coreutils';
import { InspectionHandler } from './handler';
/**
 * The default connector for making inspection requests from the Jupyter API.
 */
export declare class KernelConnector extends DataConnector<InspectionHandler.IReply, void, InspectionHandler.IRequest> {
    /**
     * Create a new kernel connector for inspection requests.
     *
     * @param options - The instatiation options for the kernel connector.
     */
    constructor(options: KernelConnector.IOptions);
    /**
     * Fetch inspection requests.
     *
     * @param request - The inspection request text and details.
     */
    fetch(request: InspectionHandler.IRequest): Promise<InspectionHandler.IReply>;
    private _session;
}
/**
 * A namespace for kernel connector statics.
 */
export declare namespace KernelConnector {
    /**
     * The instantiation options for an inspection handler.
     */
    interface IOptions {
        /**
         * The session used to make API requests to the kernel.
         */
        session: IClientSession;
    }
}
