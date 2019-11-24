import { IIterator, IterableOrArrayLike } from '@phosphor/algorithm';
import { JSONObject } from '@phosphor/coreutils';
import { IDisposable } from '@phosphor/disposable';
import { Message } from '@phosphor/messaging';
import { ISignal } from '@phosphor/signaling';
import { Widget } from '@phosphor/widgets';
import { CodeEditor } from '@jupyterlab/codeeditor';
/**
 * A widget that enables text completion.
 */
export declare class Completer extends Widget {
    /**
     * Construct a text completer menu widget.
     */
    constructor(options: Completer.IOptions);
    /**
     * The editor used by the completion widget.
     */
    editor: CodeEditor.IEditor | null;
    /**
     * A signal emitted when a selection is made from the completer menu.
     */
    readonly selected: ISignal<this, string>;
    /**
     * A signal emitted when the completer widget's visibility changes.
     *
     * #### Notes
     * This signal is useful when there are multiple floating widgets that may
     * contend with the same space and ought to be mutually exclusive.
     */
    readonly visibilityChanged: ISignal<this, void>;
    /**
     * The model used by the completer widget.
     */
    model: Completer.IModel | null;
    /**
     * Dispose of the resources held by the completer widget.
     */
    dispose(): void;
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
     * Reset the widget.
     */
    reset(): void;
    /**
     * Emit the selected signal for the current active item and reset.
     */
    selectActive(): void;
    /**
     * Handle `after-attach` messages for the widget.
     */
    protected onAfterAttach(msg: Message): void;
    /**
     * Handle `before-detach` messages for the widget.
     */
    protected onBeforeDetach(msg: Message): void;
    /**
     * Handle model state changes.
     */
    protected onModelStateChanged(): void;
    /**
     * Handle `update-request` messages.
     */
    protected onUpdateRequest(msg: Message): void;
    /**
     * Cycle through the available completer items.
     *
     * #### Notes
     * When the user cycles all the way `down` to the last index, subsequent
     * `down` cycles will remain on the last index. When the user cycles `up` to
     * the first item, subsequent `up` cycles will remain on the first cycle.
     */
    private _cycle;
    /**
     * Handle keydown events for the widget.
     */
    private _evtKeydown;
    /**
     * Handle mousedown events for the widget.
     */
    private _evtMousedown;
    /**
     * Handle scroll events for the widget
     */
    private _evtScroll;
    /**
     * Populate the completer up to the longest initial subset of items.
     *
     * @returns `true` if a subset match was found and populated.
     */
    private _populateSubset;
    /**
     * Set the visible dimensions of the widget.
     */
    private _setGeometry;
    private _activeIndex;
    private _editor;
    private _model;
    private _renderer;
    private _resetFlag;
    private _selected;
    private _visibilityChanged;
}
export declare namespace Completer {
    /**
     * A type map that may add type annotations to completer matches.
     */
    type TypeMap = {
        [index: string]: string;
    };
    /**
     * The initialization options for a completer widget.
     */
    interface IOptions {
        /**
         * The semantic parent of the completer widget, its referent editor.
         */
        editor?: CodeEditor.IEditor | null;
        /**
         * The model for the completer widget.
         */
        model?: IModel;
        /**
         * The renderer for the completer widget nodes.
         */
        renderer?: IRenderer;
    }
    /**
     * An interface for a completion request reflecting the state of the editor.
     */
    interface ITextState extends JSONObject {
        /**
         * The current value of the editor.
         */
        readonly text: string;
        /**
         * The height of a character in the editor.
         */
        readonly lineHeight: number;
        /**
         * The width of a character in the editor.
         */
        readonly charWidth: number;
        /**
         * The line number of the editor cursor.
         */
        readonly line: number;
        /**
         * The character number of the editor cursor within a line.
         */
        readonly column: number;
    }
    /**
     * The data model backing a code completer widget.
     */
    interface IModel extends IDisposable {
        /**
         * A signal emitted when state of the completer menu changes.
         */
        readonly stateChanged: ISignal<IModel, void>;
        /**
         * The current text state details.
         */
        current: ITextState | null;
        /**
         * The cursor details that the API has used to return matching options.
         */
        cursor: ICursorSpan | null;
        /**
         * A flag that is true when the model value was modified by a subset match.
         */
        subsetMatch: boolean;
        /**
         * The original completer request details.
         */
        original: ITextState | null;
        /**
         * The query against which items are filtered.
         */
        query: string;
        /**
         * Get the of visible items in the completer menu.
         */
        items(): IIterator<IItem>;
        /**
         * Get the unfiltered options in a completer menu.
         */
        options(): IIterator<string>;
        /**
         * The map from identifiers (`a.b`) to their types (function, module, class,
         * instance, etc.).
         */
        typeMap(): TypeMap;
        /**
         * An ordered list of types used for visual encoding.
         */
        orderedTypes(): string[];
        /**
         * Set the available options in the completer menu.
         */
        setOptions(options: IterableOrArrayLike<string>, typeMap?: JSONObject): void;
        /**
         * Handle a cursor change.
         */
        handleCursorChange(change: Completer.ITextState): void;
        /**
         * Handle a completion request.
         */
        handleTextChange(change: Completer.ITextState): void;
        /**
         * Create a resolved patch between the original state and a patch string.
         */
        createPatch(patch: string): IPatch | undefined;
        /**
         * Reset the state of the model and emit a state change signal.
         *
         * @param hard - Reset even if a subset match is in progress.
         */
        reset(hard?: boolean): void;
    }
    /**
     * An object describing a completion option injection into text.
     */
    interface IPatch {
        /**
         * The patched text.
         */
        text: string;
        /**
         * The offset of the cursor.
         */
        offset: number;
    }
    /**
     * A completer menu item.
     */
    interface IItem {
        /**
         * The highlighted, marked up text of a visible completer item.
         */
        text: string;
        /**
         * The raw text of a visible completer item.
         */
        raw: string;
    }
    /**
     * A cursor span.
     */
    interface ICursorSpan extends JSONObject {
        /**
         * The start position of the cursor.
         */
        start: number;
        /**
         * The end position of the cursor.
         */
        end: number;
    }
    /**
     * A renderer for completer widget nodes.
     */
    interface IRenderer {
        /**
         * Create an item node (an `li` element) for a text completer menu.
         */
        createItemNode(item: IItem, typeMap: TypeMap, orderedTypes: string[]): HTMLLIElement;
    }
    /**
     * The default implementation of an `IRenderer`.
     */
    class Renderer implements IRenderer {
        /**
         * Create an item node for a text completer menu.
         */
        createItemNode(item: IItem, typeMap: TypeMap, orderedTypes: string[]): HTMLLIElement;
    }
    /**
     * The default `IRenderer` instance.
     */
    const defaultRenderer: Renderer;
}
