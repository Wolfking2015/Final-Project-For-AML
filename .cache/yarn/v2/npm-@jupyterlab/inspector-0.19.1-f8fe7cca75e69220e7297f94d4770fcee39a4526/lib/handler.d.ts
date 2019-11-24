import { CodeEditor } from '@jupyterlab/codeeditor';
import { IDataConnector } from '@jupyterlab/coreutils';
import { ReadonlyJSONObject } from '@phosphor/coreutils';
import { IDisposable } from '@phosphor/disposable';
import { ISignal } from '@phosphor/signaling';
import { RenderMimeRegistry } from '@jupyterlab/rendermime';
import { IInspector } from './inspector';
/**
 * An object that handles code inspection.
 */
export declare class InspectionHandler implements IDisposable, IInspector.IInspectable {
    /**
     * Construct a new inspection handler for a widget.
     */
    constructor(options: InspectionHandler.IOptions);
    /**
     * A signal emitted when the handler is disposed.
     */
    readonly disposed: ISignal<InspectionHandler, void>;
    /**
     * A signal emitted when inspector should clear all items with no history.
     */
    readonly ephemeralCleared: ISignal<InspectionHandler, void>;
    /**
     * A signal emitted when an inspector value is generated.
     */
    readonly inspected: ISignal<InspectionHandler, IInspector.IInspectorUpdate>;
    /**
     * The editor widget used by the inspection handler.
     */
    editor: CodeEditor.IEditor | null;
    /**
     * Indicates whether the handler makes API inspection requests or stands by.
     *
     * #### Notes
     * The use case for this attribute is to limit the API traffic when no
     * inspector is visible.
     */
    standby: boolean;
    /**
     * Get whether the inspection handler is disposed.
     *
     * #### Notes
     * This is a read-only property.
     */
    readonly isDisposed: boolean;
    /**
     * Dispose of the resources used by the handler.
     */
    dispose(): void;
    /**
     * Handle a text changed signal from an editor.
     *
     * #### Notes
     * Update the hints inspector based on a text change.
     */
    protected onTextChanged(): void;
    private _connector;
    private _disposed;
    private _editor;
    private _ephemeralCleared;
    private _inspected;
    private _isDisposed;
    private _pending;
    private _rendermime;
    private _standby;
}
/**
 * A namespace for inspection handler statics.
 */
export declare namespace InspectionHandler {
    /**
     * The instantiation options for an inspection handler.
     */
    interface IOptions {
        /**
         * The connector used to make inspection requests.
         *
         * #### Notes
         * The only method of this connector that will ever be called is `fetch`, so
         * it is acceptable for the other methods to be simple functions that return
         * rejected promises.
         */
        connector: IDataConnector<IReply, void, IRequest>;
        /**
         * The mime renderer for the inspection handler.
         */
        rendermime: RenderMimeRegistry;
    }
    /**
     * A reply to an inspection request.
     */
    interface IReply {
        /**
         * The MIME bundle data returned from an inspection request.
         */
        data: ReadonlyJSONObject;
        /**
         * Any metadata that accompanies the MIME bundle returning from a request.
         */
        metadata: ReadonlyJSONObject;
    }
    /**
     * The details of an inspection request.
     */
    interface IRequest {
        /**
         * The cursor offset position within the text being inspected.
         */
        offset: number;
        /**
         * The text being inspected.
         */
        text: string;
    }
}
