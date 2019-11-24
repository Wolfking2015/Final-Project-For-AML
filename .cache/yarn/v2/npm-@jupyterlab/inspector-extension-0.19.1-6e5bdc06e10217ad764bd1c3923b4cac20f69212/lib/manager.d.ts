import { IInspector, InspectorPanel } from '@jupyterlab/inspector';
import { IDisposable } from '@phosphor/disposable';
/**
 * A class that manages inspector widget instances and offers persistent
 * `IInspector` instance that other plugins can communicate with.
 */
export declare class InspectorManager implements IInspector {
    /**
     * The current inspector widget.
     */
    inspector: InspectorPanel;
    /**
     * The source of events the inspector panel listens for.
     */
    source: IInspector.IInspectable;
    /**
     * Create an inspector child item and return a disposable to remove it.
     *
     * @param item - The inspector child item being added to the inspector.
     *
     * @returns A disposable that removes the child item from the inspector.
     */
    add(item: IInspector.IInspectorItem): IDisposable;
    /**
     * Handle the source disposed signal.
     */
    private _onSourceDisposed;
    private _inspector;
    private _source;
}
