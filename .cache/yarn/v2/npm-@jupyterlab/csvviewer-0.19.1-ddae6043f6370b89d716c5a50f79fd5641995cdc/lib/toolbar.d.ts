import { Message } from '@phosphor/messaging';
import { ISignal } from '@phosphor/signaling';
import { Widget } from '@phosphor/widgets';
/**
 * A widget for selecting a delimiter.
 */
export declare class CSVDelimiter extends Widget {
    /**
     * Construct a new csv table widget.
     */
    constructor(options: CSVToolbar.IOptions);
    /**
     * A signal emitted when the delimiter selection has changed.
     */
    readonly delimiterChanged: ISignal<this, string>;
    /**
     * The delimiter dropdown menu.
     */
    readonly selectNode: HTMLSelectElement;
    /**
     * Handle the DOM events for the widget.
     *
     * @param event - The DOM event sent to the widget.
     *
     * #### Notes
     * This method implements the DOM `EventListener` interface and is
     * called in response to events on the dock panel's node. It should
     * not be called directly by user code.
     */
    handleEvent(event: Event): void;
    /**
     * Handle `after-attach` messages for the widget.
     */
    protected onAfterAttach(msg: Message): void;
    /**
     * Handle `before-detach` messages for the widget.
     */
    protected onBeforeDetach(msg: Message): void;
    private _delimiterChanged;
}
/**
 * A namespace for `CSVToolbar` statics.
 */
export declare namespace CSVToolbar {
    /**
     * The instantiation options for a CSV toolbar.
     */
    interface IOptions {
        /**
         * The initially selected delimiter.
         */
        selected: string;
    }
}
