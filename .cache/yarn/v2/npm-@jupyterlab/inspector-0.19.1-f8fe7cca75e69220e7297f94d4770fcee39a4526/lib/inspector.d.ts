import { Token } from '@phosphor/coreutils';
import { IDisposable } from '@phosphor/disposable';
import { ISignal } from '@phosphor/signaling';
import { TabPanel, Widget } from '@phosphor/widgets';
/**
 * The inspector panel token.
 */
export declare const IInspector: Token<IInspector>;
/**
 * An interface for an inspector.
 */
export interface IInspector {
    /**
     * Create an inspector child item and return a disposable to remove it.
     *
     * @param item - The inspector child item being added to the inspector.
     *
     * @returns A disposable that removes the child item from the inspector.
     */
    add(item: IInspector.IInspectorItem): IDisposable;
    /**
     * The source of events the inspector listens for.
     */
    source: IInspector.IInspectable | null;
}
/**
 * A namespace for inspector interfaces.
 */
export declare namespace IInspector {
    /**
     * The definition of an inspectable source.
     */
    interface IInspectable {
        /**
         * A signal emitted when the handler is disposed.
         */
        disposed: ISignal<any, void>;
        /**
         * A signal emitted when inspector should clear all items with no history.
         */
        ephemeralCleared: ISignal<any, void>;
        /**
         * A signal emitted when an inspector value is generated.
         */
        inspected: ISignal<any, IInspectorUpdate>;
        /**
         * Indicates whether the inspectable source emits signals.
         *
         * #### Notes
         * The use case for this attribute is to limit the API traffic when no
         * inspector is visible.
         */
        standby: boolean;
    }
    /**
     * The definition of a child item of an inspector.
     */
    interface IInspectorItem {
        /**
         * The optional class name added to the inspector child widget.
         */
        className?: string;
        /**
         * The display name of the inspector child.
         */
        name: string;
        /**
         * The rank order of display priority for inspector updates. A lower rank
         * denotes a higher display priority.
         */
        rank: number;
        /**
         * A flag that indicates whether the inspector remembers history.
         *
         * The default value is `false`.
         */
        remembers?: boolean;
        /**
         * The type of the inspector.
         */
        type: string;
    }
    /**
     * An update value for code inspectors.
     */
    interface IInspectorUpdate {
        /**
         * The content being sent to the inspector for display.
         */
        content: Widget | null;
        /**
         * The type of the inspector being updated.
         */
        type: string;
    }
}
/**
 * A panel which contains a set of inspectors.
 */
export declare class InspectorPanel extends TabPanel implements IInspector {
    /**
     * Construct an inspector.
     */
    constructor();
    /**
     * The source of events the inspector panel listens for.
     */
    source: IInspector.IInspectable | null;
    /**
     * Create an inspector child item and return a disposable to remove it.
     *
     * @param item - The inspector child item being added to the inspector.
     *
     * @returns A disposable that removes the child item from the inspector.
     */
    add(item: IInspector.IInspectorItem): IDisposable;
    /**
     * Dispose of the resources held by the widget.
     */
    dispose(): void;
    /**
     * Handle inspector update signals.
     */
    protected onInspectorUpdate(sender: any, args: IInspector.IInspectorUpdate): void;
    /**
     * Handle source disposed signals.
     */
    protected onSourceDisposed(sender: any, args: void): void;
    private _items;
    private _source;
}
