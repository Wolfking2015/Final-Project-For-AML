import { IIterator, IterableOrArrayLike } from '@phosphor/algorithm';
import { ISignal } from '@phosphor/signaling';
import { Completer } from './widget';
/**
 * An implementation of a completer model.
 */
export declare class CompleterModel implements Completer.IModel {
    /**
     * A signal emitted when state of the completer menu changes.
     */
    readonly stateChanged: ISignal<this, void>;
    /**
     * The original completion request details.
     */
    original: Completer.ITextState | null;
    /**
     * The current text change details.
     */
    current: Completer.ITextState | null;
    /**
     * The cursor details that the API has used to return matching options.
     */
    cursor: Completer.ICursorSpan | null;
    /**
     * The query against which items are filtered.
     */
    query: string;
    /**
     * A flag that is true when the model value was modified by a subset match.
     */
    subsetMatch: boolean;
    /**
     * Get whether the model is disposed.
     */
    readonly isDisposed: boolean;
    /**
     * Dispose of the resources held by the model.
     */
    dispose(): void;
    /**
     * The list of visible items in the completer menu.
     *
     * #### Notes
     * This is a read-only property.
     */
    items(): IIterator<Completer.IItem>;
    /**
     * The unfiltered list of all available options in a completer menu.
     */
    options(): IIterator<string>;
    /**
     * The map from identifiers (a.b) to types (function, module, class, instance,
     * etc.).
     *
     * #### Notes
     * A type map is currently only provided by the latest IPython kernel using
     * the completer reply metadata field `_jupyter_types_experimental`. The
     * values are completely up to the kernel.
     *
     */
    typeMap(): Completer.TypeMap;
    /**
     * An ordered list of all the known types in the typeMap.
     *
     * #### Notes
     * To visually encode the types of the completer matches, we assemble an
     * ordered list. This list begins with:
     * ```
     * ['function', 'instance', 'class', 'module', 'keyword']
     * ```
     * and then has any remaining types listed alphebetically. This will give
     * reliable visual encoding for these known types, but allow kernels to
     * provide new types.
     */
    orderedTypes(): string[];
    /**
     * Set the available options in the completer menu.
     */
    setOptions(newValue: IterableOrArrayLike<string>, typeMap?: Completer.TypeMap): void;
    /**
     * Handle a cursor change.
     */
    handleCursorChange(change: Completer.ITextState): void;
    /**
     * Handle a text change.
     */
    handleTextChange(change: Completer.ITextState): void;
    /**
     * Create a resolved patch between the original state and a patch string.
     *
     * @param patch - The patch string to apply to the original value.
     *
     * @returns A patched text change or undefined if original value did not exist.
     */
    createPatch(patch: string): Completer.IPatch | undefined;
    /**
     * Reset the state of the model and emit a state change signal.
     *
     * @param hard - Reset even if a subset match is in progress.
     */
    reset(hard?: boolean): void;
    /**
     * Apply the query to the complete options list to return the matching subset.
     */
    private _filter;
    /**
     * Reset the state of the model.
     */
    private _reset;
    private _current;
    private _cursor;
    private _isDisposed;
    private _options;
    private _original;
    private _query;
    private _subsetMatch;
    private _typeMap;
    private _orderedTypes;
    private _stateChanged;
}
