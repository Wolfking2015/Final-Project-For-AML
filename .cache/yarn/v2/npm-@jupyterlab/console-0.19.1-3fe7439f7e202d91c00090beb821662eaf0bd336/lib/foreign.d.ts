import { IClientSession } from '@jupyterlab/apputils';
import { Cell, CodeCell } from '@jupyterlab/cells';
import { KernelMessage } from '@jupyterlab/services';
import { IDisposable } from '@phosphor/disposable';
/**
 * A handler for capturing API messages from other sessions that should be
 * rendered in a given parent.
 */
export declare class ForeignHandler implements IDisposable {
    /**
     * Construct a new foreign message handler.
     */
    constructor(options: ForeignHandler.IOptions);
    /**
     * Set whether the handler is able to inject foreign cells into a console.
     */
    enabled: boolean;
    /**
     * The client session used by the foreign handler.
     */
    readonly session: IClientSession;
    /**
     * The foreign handler's parent receiver.
     */
    readonly parent: ForeignHandler.IReceiver;
    /**
     * Test whether the handler is disposed.
     */
    readonly isDisposed: boolean;
    /**
     * Dispose the resources held by the handler.
     */
    dispose(): void;
    /**
     * Handler IOPub messages.
     *
     * @returns `true` if the message resulted in a new cell injection or a
     * previously injected cell being updated and `false` for all other messages.
     */
    protected onIOPubMessage(sender: IClientSession, msg: KernelMessage.IIOPubMessage): boolean;
    /**
     * Create a new code cell for an input originated from a foreign session.
     */
    private _newCell;
    private _cells;
    private _enabled;
    private _parent;
    private _factory;
    private _isDisposed;
}
/**
 * A namespace for `ForeignHandler` statics.
 */
export declare namespace ForeignHandler {
    /**
     * The instantiation options for a foreign handler.
     */
    interface IOptions {
        /**
         * The client session used by the foreign handler.
         */
        session: IClientSession;
        /**
         * The parent into which the handler will inject code cells.
         */
        parent: IReceiver;
        /**
         * The cell factory for foreign handlers.
         */
        cellFactory: () => CodeCell;
    }
    /**
     * A receiver of newly created foreign cells.
     */
    interface IReceiver {
        /**
         * Add a newly created foreign cell.
         */
        addCell(cell: Cell): void;
        /**
         * Trigger a rendering update on the receiver.
         */
        update(): void;
    }
}
