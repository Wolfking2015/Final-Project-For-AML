import { TerminalSession } from '@jupyterlab/services';
import { Message } from '@phosphor/messaging';
import { Widget } from '@phosphor/widgets';
/**
 * A widget which manages a terminal session.
 */
export declare class Terminal extends Widget {
    /**
     * Construct a new terminal widget.
     *
     * @param options - The terminal configuration options.
     */
    constructor(options?: Partial<Terminal.IOptions>);
    /**
     * The terminal session associated with the widget.
     */
    session: TerminalSession.ISession | null;
    /**
     * Get the font size of the terminal in pixels.
     */
    /**
    * Set the font size of the terminal in pixels.
    */
    fontSize: number;
    /**
     * Get the current theme, either light or dark.
     */
    /**
    * Set the current theme, either light or dark.
    */
    theme: Terminal.Theme;
    /**
     * Dispose of the resources held by the terminal widget.
     */
    dispose(): void;
    /**
     * Refresh the terminal session.
     */
    refresh(): Promise<void>;
    /**
     * Process a message sent to the widget.
     *
     * @param msg - The message sent to the widget.
     *
     * #### Notes
     * Subclasses may reimplement this method as needed.
     */
    processMessage(msg: Message): void;
    /**
     * Set the size of the terminal when attached if dirty.
     */
    protected onAfterAttach(msg: Message): void;
    /**
     * Set the size of the terminal when shown if dirty.
     */
    protected onAfterShow(msg: Message): void;
    /**
     * On resize, use the computed row and column sizes to resize the terminal.
     */
    protected onResize(msg: Widget.ResizeMessage): void;
    /**
     * A message handler invoked on an `'update-request'` message.
     */
    protected onUpdateRequest(msg: Message): void;
    /**
     * A message handler invoked on an `'fit-request'` message.
     */
    protected onFitRequest(msg: Message): void;
    /**
     * Handle `'activate-request'` messages.
     */
    protected onActivateRequest(msg: Message): void;
    /**
     * Initialize the terminal object.
     */
    private _initializeTerm;
    /**
     * Handle a message from the terminal session.
     */
    private _onMessage;
    /**
     * Resize the terminal based on computed geometry.
     */
    private _resizeTerminal;
    /**
     * Set the size of the terminal in the session.
     */
    private _setSessionSize;
    private _term;
    private _needsResize;
    private _theme;
    private _session;
    private _initialCommand;
    private _termOpened;
    private _offsetWidth;
    private _offsetHeight;
}
/**
 * The namespace for `Terminal` class statics.
 */
export declare namespace Terminal {
    /**
     * Options for the terminal widget.
     */
    interface IOptions {
        /**
         * The font size of the terminal in pixels.
         */
        fontSize: number;
        /**
         * The theme of the terminal.
         */
        theme: Theme;
        /**
         * Whether to blink the cursor.  Can only be set at startup.
         */
        cursorBlink: boolean;
        /**
         * An optional command to run when the session starts.
         */
        initialCommand: string;
    }
    /**
     * The default options used for creating terminals.
     */
    const defaultOptions: IOptions;
    /**
     * A type for the terminal theme.
     */
    type Theme = 'light' | 'dark';
}
