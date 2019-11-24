import { Message } from '@phosphor/messaging';
import { ISignal } from '@phosphor/signaling';
import { Widget } from '@phosphor/widgets';
import { ServiceManager, Session, TerminalSession } from '@jupyterlab/services';
import '../style/index.css';
/**
 * A class that exposes the running terminal and kernel sessions.
 */
export declare class RunningSessions extends Widget {
    /**
     * Construct a new running widget.
     */
    constructor(options: RunningSessions.IOptions);
    protected onUpdateRequest(msg: Message): void;
    protected onAfterAttach(msg: Message): void;
    /**
     * A signal emitted when a kernel session open is requested.
     */
    readonly sessionOpenRequested: ISignal<this, Session.IModel>;
    /**
     * A signal emitted when a terminal session open is requested.
     */
    readonly terminalOpenRequested: ISignal<this, TerminalSession.IModel>;
    private _sessionOpenRequested;
    private _terminalOpenRequested;
    private options;
}
/**
 * The namespace for the `RunningSessions` class statics.
 */
export declare namespace RunningSessions {
    /**
     * An options object for creating a running sessions widget.
     */
    interface IOptions {
        /**
         * A service manager instance.
         */
        manager: ServiceManager.IManager;
    }
}
