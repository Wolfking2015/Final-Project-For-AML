import { ServiceManager } from '@jupyterlab/services';
import { Message } from '@phosphor/messaging';
import { Widget } from '@phosphor/widgets';
import { JupyterLab } from '@jupyterlab/application';
import { ISignal } from '@phosphor/signaling';
import { IDiffCallback } from '../git';
import '../../style/variables.css';
/**
 * An options object for creating a running sessions widget.
 */
export interface IOptions {
    /**
     * A service manager instance.
     */
    manager: ServiceManager.IManager;
    /**
     * The renderer for the running sessions widget.
     * The default is a shared renderer instance.
     */
    renderer?: IRenderer;
}
/**
 * A renderer for use with a running sessions widget.
 */
export interface IRenderer {
    createNode(): HTMLElement;
}
/**
 * The default implementation of `IRenderer`.
 */
export declare class Renderer implements IRenderer {
    createNode(): HTMLElement;
}
/**
 * The default `Renderer` instance.
 */
export declare const defaultRenderer: Renderer;
/**
 * A class that exposes the git-plugin sessions.
 */
export declare class GitWidget extends Widget {
    component: any;
    /**
     * Construct a new running widget.
     */
    constructor(app: JupyterLab, options: IOptions, diffFunction: IDiffCallback);
    /**
     * Override widget's default show() to
     * refresh content every time Git widget is shown.
     */
    show(): void;
    /**
     * The renderer used by the running sessions widget.
     */
    readonly renderer: IRenderer;
    /**
     * A signal emitted when the directory listing is refreshed.
     */
    readonly refreshed: ISignal<this, void>;
    /**
     * Get the input text node.
     */
    readonly inputNode: HTMLInputElement;
    /**
     * Dispose of the resources used by the widget.
     */
    dispose(): void;
    /**
     * Handle the DOM events for the widget.
     *
     * @param event - The DOM event sent to the widget.
     *
     * #### Notes
     * This method implements the DOM `EventListener` interface and is
     * called in response to events on the widget's DOM nodes. It should
     * not be called directly by user code.
     */
    handleEvent(event: Event): void;
    /**
     * A message handler invoked on an `'after-attach'` message.
     */
    protected onAfterAttach(msg: Message): void;
    /**
     * A message handler invoked on a `'before-detach'` message.
     */
    protected onBeforeDetach(msg: Message): void;
    /**
     * Handle the `'click'` event for the widget.
     *
     * #### Notes
     * This listener is attached to the document node.
     */
    private _evtChange;
    /**
     * Handle the `'click'` event for the widget.
     *
     * #### Notes
     * This listener is attached to the document node.
     */
    private _evtClick;
    /**
     * Handle the `'dblclick'` event for the widget.
     */
    private _evtDblClick;
    private _renderer;
    private _refreshId;
    private _refreshed;
}
