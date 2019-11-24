import { ISettingRegistry } from '@jupyterlab/coreutils';
import { Message } from '@phosphor/messaging';
import { ISignal } from '@phosphor/signaling';
import { Widget } from '@phosphor/widgets';
/**
 * A list of plugins with editable settings.
 */
export declare class PluginList extends Widget {
    /**
     * Create a new plugin list.
     */
    constructor(options: PluginList.IOptions);
    /**
     * The setting registry.
     */
    readonly registry: ISettingRegistry;
    /**
     * A signal emitted when a list user interaction happens.
     */
    readonly changed: ISignal<this, void>;
    /**
     * The editor type currently selected.
     */
    editor: 'raw' | 'table';
    /**
     * The selection value of the plugin list.
     */
    readonly scrollTop: number;
    /**
     * The selection value of the plugin list.
     */
    selection: string;
    /**
     * Handle the DOM events for the widget.
     *
     * @param event - The DOM event sent to the widget.
     *
     * #### Notes
     * This method implements the DOM `EventListener` interface and is
     * called in response to events on the plugin list's node. It should
     * not be called directly by user code.
     */
    handleEvent(event: Event): void;
    /**
     * Handle `'after-attach'` messages.
     */
    protected onAfterAttach(msg: Message): void;
    /**
     * Handle `before-detach` messages for the widget.
     */
    protected onBeforeDetach(msg: Message): void;
    /**
     * Handle `'update-request'` messages.
     */
    protected onUpdateRequest(msg: Message): void;
    /**
     * Handle the `'mousedown'` event for the plugin list.
     *
     * @param event - The DOM event sent to the widget
     */
    private _evtMousedown;
    private _changed;
    private _confirm;
    private _editor;
    private _scrollTop;
    private _selection;
}
/**
 * A namespace for `PluginList` statics.
 */
export declare namespace PluginList {
    /**
     * The instantiation options for a plugin list.
     */
    interface IOptions {
        /**
         * A function that allows for asynchronously confirming a selection.
         *
         * #### Notest
         * If the promise returned by the function resolves, then the selection will
         * succeed and emit an event. If the promise rejects, the selection is not
         * made.
         */
        confirm: () => Promise<void>;
        /**
         * The setting registry for the plugin list.
         */
        registry: ISettingRegistry;
    }
}
