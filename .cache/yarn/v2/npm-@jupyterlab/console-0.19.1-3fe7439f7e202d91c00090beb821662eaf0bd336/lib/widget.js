"use strict";
// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
Object.defineProperty(exports, "__esModule", { value: true });
const cells_1 = require("@jupyterlab/cells");
const observables_1 = require("@jupyterlab/observables");
const algorithm_1 = require("@phosphor/algorithm");
const signaling_1 = require("@phosphor/signaling");
const widgets_1 = require("@phosphor/widgets");
const foreign_1 = require("./foreign");
const history_1 = require("./history");
/**
 * The data attribute added to a widget that has an active kernel.
 */
const KERNEL_USER = 'jpKernelUser';
/**
 * The data attribute added to a widget can run code.
 */
const CODE_RUNNER = 'jpCodeRunner';
/**
 * The class name added to console widgets.
 */
const CONSOLE_CLASS = 'jp-CodeConsole';
/**
 * The class name added to the console banner.
 */
const BANNER_CLASS = 'jp-CodeConsole-banner';
/**
 * The class name of a cell whose input originated from a foreign session.
 */
const FOREIGN_CELL_CLASS = 'jp-CodeConsole-foreignCell';
/**
 * The class name of the active prompt cell.
 */
const PROMPT_CLASS = 'jp-CodeConsole-promptCell';
/**
 * The class name of the panel that holds cell content.
 */
const CONTENT_CLASS = 'jp-CodeConsole-content';
/**
 * The class name of the panel that holds prompts.
 */
const INPUT_CLASS = 'jp-CodeConsole-input';
/**
 * The timeout in ms for execution requests to the kernel.
 */
const EXECUTION_TIMEOUT = 250;
/**
 * A widget containing a Jupyter console.
 *
 * #### Notes
 * The CodeConsole class is intended to be used within a ConsolePanel
 * instance. Under most circumstances, it is not instantiated by user code.
 */
class CodeConsole extends widgets_1.Widget {
    /**
     * Construct a console widget.
     */
    constructor(options) {
        super();
        this._banner = null;
        this._executed = new signaling_1.Signal(this);
        this._mimetype = 'text/x-ipython';
        this._promptCellCreated = new signaling_1.Signal(this);
        this.addClass(CONSOLE_CLASS);
        this.node.dataset[KERNEL_USER] = 'true';
        this.node.dataset[CODE_RUNNER] = 'true';
        this.node.tabIndex = -1; // Allow the widget to take focus.
        // Create the panels that hold the content and input.
        const layout = (this.layout = new widgets_1.PanelLayout());
        this._cells = new observables_1.ObservableList();
        this._content = new widgets_1.Panel();
        this._input = new widgets_1.Panel();
        this.contentFactory =
            options.contentFactory || CodeConsole.defaultContentFactory;
        this.modelFactory = options.modelFactory || CodeConsole.defaultModelFactory;
        this.rendermime = options.rendermime;
        this.session = options.session;
        this._mimeTypeService = options.mimeTypeService;
        // Add top-level CSS classes.
        this._content.addClass(CONTENT_CLASS);
        this._input.addClass(INPUT_CLASS);
        // Insert the content and input panes into the widget.
        layout.addWidget(this._content);
        layout.addWidget(this._input);
        // Set up the foreign iopub handler.
        this._foreignHandler = new foreign_1.ForeignHandler({
            session: this.session,
            parent: this,
            cellFactory: () => this._createCodeCell()
        });
        this._history = new history_1.ConsoleHistory({
            session: this.session
        });
        this._onKernelChanged();
        this.session.kernelChanged.connect(this._onKernelChanged, this);
        this.session.statusChanged.connect(this._onKernelStatusChanged, this);
    }
    /**
     * A signal emitted when the console finished executing its prompt cell.
     */
    get executed() {
        return this._executed;
    }
    /**
     * A signal emitted when a new prompt cell is created.
     */
    get promptCellCreated() {
        return this._promptCellCreated;
    }
    /**
     * The list of content cells in the console.
     *
     * #### Notes
     * This list does not include the current banner or the prompt for a console.
     * It may include previous banners as raw cells.
     */
    get cells() {
        return this._cells;
    }
    /*
     * The console input prompt cell.
     */
    get promptCell() {
        let inputLayout = this._input.layout;
        return inputLayout.widgets[0] || null;
    }
    /**
     * Add a new cell to the content panel.
     *
     * @param cell - The cell widget being added to the content panel.
     *
     * #### Notes
     * This method is meant for use by outside classes that want to inject content
     * into a console. It is distinct from the `inject` method in that it requires
     * rendered code cell widgets and does not execute them.
     */
    addCell(cell) {
        this._content.addWidget(cell);
        this._cells.push(cell);
        cell.disposed.connect(this._onCellDisposed, this);
        this.update();
    }
    addBanner() {
        if (this._banner) {
            // An old banner just becomes a normal cell now.
            let cell = this._banner;
            this._cells.push(this._banner);
            cell.disposed.connect(this._onCellDisposed, this);
        }
        // Create the banner.
        let model = this.modelFactory.createRawCell({});
        model.value.text = '...';
        let banner = (this._banner = new cells_1.RawCell({
            model,
            contentFactory: this.contentFactory
        }));
        banner.addClass(BANNER_CLASS);
        banner.readOnly = true;
        this._content.addWidget(banner);
    }
    /**
     * Clear the code cells.
     */
    clear() {
        // Dispose all the content cells
        let cells = this._cells;
        while (cells.length > 0) {
            cells.get(0).dispose();
        }
    }
    /**
     * Dispose of the resources held by the widget.
     */
    dispose() {
        // Do nothing if already disposed.
        if (this.isDisposed) {
            return;
        }
        this._cells.clear();
        this._history.dispose();
        this._foreignHandler.dispose();
        super.dispose();
    }
    /**
     * Set whether the foreignHandler is able to inject foreign cells into a
     * console.
     */
    get showAllActivity() {
        return this._foreignHandler.enabled;
    }
    set showAllActivity(value) {
        this._foreignHandler.enabled = value;
    }
    /**
     * Execute the current prompt.
     *
     * @param force - Whether to force execution without checking code
     * completeness.
     *
     * @param timeout - The length of time, in milliseconds, that the execution
     * should wait for the API to determine whether code being submitted is
     * incomplete before attempting submission anyway. The default value is `250`.
     */
    execute(force = false, timeout = EXECUTION_TIMEOUT) {
        if (this.session.status === 'dead') {
            return Promise.resolve(void 0);
        }
        const promptCell = this.promptCell;
        if (!promptCell) {
            return Promise.reject('Cannot execute without a prompt cell');
        }
        promptCell.model.trusted = true;
        if (force) {
            // Create a new prompt cell before kernel execution to allow typeahead.
            this.newPromptCell();
            return this._execute(promptCell);
        }
        // Check whether we should execute.
        return this._shouldExecute(timeout).then(should => {
            if (this.isDisposed) {
                return;
            }
            if (should) {
                // Create a new prompt cell before kernel execution to allow typeahead.
                this.newPromptCell();
                this.promptCell.editor.focus();
                return this._execute(promptCell);
            }
            else {
                // add a newline if we shouldn't execute
                promptCell.editor.newIndentedLine();
            }
        });
    }
    /**
     * Inject arbitrary code for the console to execute immediately.
     *
     * @param code - The code contents of the cell being injected.
     *
     * @returns A promise that indicates when the injected cell's execution ends.
     */
    inject(code) {
        let cell = this._createCodeCell();
        cell.model.value.text = code;
        this.addCell(cell);
        return this._execute(cell);
    }
    /**
     * Insert a line break in the prompt cell.
     */
    insertLinebreak() {
        let promptCell = this.promptCell;
        if (!promptCell) {
            return;
        }
        promptCell.editor.newIndentedLine();
    }
    /**
     * Serialize the output.
     *
     * #### Notes
     * This only serializes the code cells and the prompt cell if it exists, and
     * skips any old banner cells.
     */
    serialize() {
        const cells = [];
        algorithm_1.each(this._cells, cell => {
            let model = cell.model;
            if (cells_1.isCodeCellModel(model)) {
                cells.push(model.toJSON());
            }
        });
        if (this.promptCell) {
            cells.push(this.promptCell.model.toJSON());
        }
        return cells;
    }
    /**
     * Handle the DOM events for the widget.
     *
     * @param event - The DOM event sent to the widget.
     *
     * #### Notes
     * This method implements the DOM `EventListener` interface and is
     * called in response to events on the notebook panel's node. It should
     * not be called directly by user code.
     */
    handleEvent(event) {
        switch (event.type) {
            case 'keydown':
                this._evtKeyDown(event);
                break;
            case 'click':
                this._evtClick(event);
                break;
            default:
                break;
        }
    }
    /**
     * Handle `after_attach` messages for the widget.
     */
    onAfterAttach(msg) {
        let node = this.node;
        node.addEventListener('keydown', this, true);
        node.addEventListener('click', this);
        // Create a prompt if necessary.
        if (!this.promptCell) {
            this.newPromptCell();
        }
        else {
            this.promptCell.editor.focus();
            this.update();
        }
    }
    /**
     * Handle `before-detach` messages for the widget.
     */
    onBeforeDetach(msg) {
        let node = this.node;
        node.removeEventListener('keydown', this, true);
        node.removeEventListener('click', this);
    }
    /**
     * Handle `'activate-request'` messages.
     */
    onActivateRequest(msg) {
        let editor = this.promptCell && this.promptCell.editor;
        if (editor) {
            editor.focus();
        }
        this.update();
    }
    /**
     * Make a new prompt cell.
     */
    newPromptCell() {
        let promptCell = this.promptCell;
        let input = this._input;
        // Make the last prompt read-only, clear its signals, and move to content.
        if (promptCell) {
            promptCell.readOnly = true;
            promptCell.removeClass(PROMPT_CLASS);
            signaling_1.Signal.clearData(promptCell.editor);
            let child = input.widgets[0];
            child.parent = null;
            this.addCell(promptCell);
        }
        // Create the new prompt cell.
        let factory = this.contentFactory;
        let options = this._createCodeCellOptions();
        promptCell = factory.createCodeCell(options);
        promptCell.model.mimeType = this._mimetype;
        promptCell.addClass(PROMPT_CLASS);
        this._input.addWidget(promptCell);
        // Suppress the default "Enter" key handling.
        let editor = promptCell.editor;
        editor.addKeydownHandler(this._onEditorKeydown);
        this._history.editor = editor;
        this._promptCellCreated.emit(promptCell);
    }
    /**
     * Handle `update-request` messages.
     */
    onUpdateRequest(msg) {
        Private.scrollToBottom(this._content.node);
    }
    /**
     * Handle the `'keydown'` event for the widget.
     */
    _evtKeyDown(event) {
        let editor = this.promptCell && this.promptCell.editor;
        if (!editor) {
            return;
        }
        if (event.keyCode === 13 && !editor.hasFocus()) {
            event.preventDefault();
            editor.focus();
        }
    }
    /**
     * Handle the `'click'` event for the widget.
     */
    _evtClick(event) {
        if (this.promptCell &&
            this.promptCell.node.contains(event.target)) {
            this.promptCell.editor.focus();
        }
    }
    /**
     * Execute the code in the current prompt cell.
     */
    _execute(cell) {
        let source = cell.model.value.text;
        this._history.push(source);
        // If the source of the console is just "clear", clear the console as we
        // do in IPython or QtConsole.
        if (source === 'clear' || source === '%clear') {
            this.clear();
            return Promise.resolve(void 0);
        }
        cell.model.contentChanged.connect(this.update, this);
        let onSuccess = (value) => {
            if (this.isDisposed) {
                return;
            }
            if (value && value.content.status === 'ok') {
                let content = value.content;
                // Use deprecated payloads for backwards compatibility.
                if (content.payload && content.payload.length) {
                    let setNextInput = content.payload.filter(i => {
                        return i.source === 'set_next_input';
                    })[0];
                    if (setNextInput) {
                        let text = setNextInput.text;
                        // Ignore the `replace` value and always set the next cell.
                        cell.model.value.text = text;
                    }
                }
            }
            cell.model.contentChanged.disconnect(this.update, this);
            this.update();
            this._executed.emit(new Date());
        };
        let onFailure = () => {
            if (this.isDisposed) {
                return;
            }
            cell.model.contentChanged.disconnect(this.update, this);
            this.update();
        };
        return cells_1.CodeCell.execute(cell, this.session).then(onSuccess, onFailure);
    }
    /**
     * Update the console based on the kernel info.
     */
    _handleInfo(info) {
        this._banner.model.value.text = info.banner;
        let lang = info.language_info;
        this._mimetype = this._mimeTypeService.getMimeTypeByLanguage(lang);
        if (this.promptCell) {
            this.promptCell.model.mimeType = this._mimetype;
        }
    }
    /**
     * Create a new foreign cell.
     */
    _createCodeCell() {
        let factory = this.contentFactory;
        let options = this._createCodeCellOptions();
        let cell = factory.createCodeCell(options);
        cell.readOnly = true;
        cell.model.mimeType = this._mimetype;
        cell.addClass(FOREIGN_CELL_CLASS);
        return cell;
    }
    /**
     * Create the options used to initialize a code cell widget.
     */
    _createCodeCellOptions() {
        let contentFactory = this.contentFactory;
        let modelFactory = this.modelFactory;
        let model = modelFactory.createCodeCell({});
        let rendermime = this.rendermime;
        return { model, rendermime, contentFactory };
    }
    /**
     * Handle cell disposed signals.
     */
    _onCellDisposed(sender, args) {
        if (!this.isDisposed) {
            this._cells.removeValue(sender);
        }
    }
    /**
     * Test whether we should execute the prompt cell.
     */
    _shouldExecute(timeout) {
        const promptCell = this.promptCell;
        if (!promptCell) {
            return Promise.resolve(false);
        }
        let model = promptCell.model;
        let code = model.value.text;
        return new Promise((resolve, reject) => {
            let timer = setTimeout(() => {
                resolve(true);
            }, timeout);
            let kernel = this.session.kernel;
            if (!kernel) {
                resolve(false);
                return;
            }
            kernel
                .requestIsComplete({ code })
                .then(isComplete => {
                clearTimeout(timer);
                if (this.isDisposed) {
                    resolve(false);
                }
                if (isComplete.content.status !== 'incomplete') {
                    resolve(true);
                    return;
                }
                resolve(false);
            })
                .catch(() => {
                resolve(true);
            });
        });
    }
    /**
     * Handle a keydown event on an editor.
     */
    _onEditorKeydown(editor, event) {
        // Suppress "Enter" events.
        return event.keyCode === 13;
    }
    /**
     * Handle a change to the kernel.
     */
    _onKernelChanged() {
        this.clear();
        if (this._banner) {
            this._banner.dispose();
            this._banner = null;
        }
        this.addBanner();
    }
    /**
     * Handle a change to the kernel status.
     */
    _onKernelStatusChanged() {
        if (this.session.status === 'connected') {
            // we just had a kernel restart or reconnect - reset banner
            let kernel = this.session.kernel;
            if (!kernel) {
                return;
            }
            kernel
                .requestKernelInfo()
                .then(() => {
                if (this.isDisposed || !kernel || !kernel.info) {
                    return;
                }
                this._handleInfo(this.session.kernel.info);
            })
                .catch(err => {
                console.error('could not get kernel info');
            });
        }
        else if (this.session.status === 'restarting') {
            this.addBanner();
        }
    }
}
exports.CodeConsole = CodeConsole;
/**
 * A namespace for CodeConsole statics.
 */
(function (CodeConsole) {
    /**
     * Default implementation of `IContentFactory`.
     */
    class ContentFactory extends cells_1.Cell.ContentFactory {
        /**
         * Create a new code cell widget.
         *
         * #### Notes
         * If no cell content factory is passed in with the options, the one on the
         * notebook content factory is used.
         */
        createCodeCell(options) {
            if (!options.contentFactory) {
                options.contentFactory = this;
            }
            return new cells_1.CodeCell(options);
        }
        /**
         * Create a new raw cell widget.
         *
         * #### Notes
         * If no cell content factory is passed in with the options, the one on the
         * notebook content factory is used.
         */
        createRawCell(options) {
            if (!options.contentFactory) {
                options.contentFactory = this;
            }
            return new cells_1.RawCell(options);
        }
    }
    CodeConsole.ContentFactory = ContentFactory;
    /**
     * A default content factory for the code console.
     */
    CodeConsole.defaultContentFactory = new ContentFactory();
    /**
     * The default implementation of an `IModelFactory`.
     */
    class ModelFactory {
        /**
         * Create a new cell model factory.
         */
        constructor(options = {}) {
            this.codeCellContentFactory =
                options.codeCellContentFactory || cells_1.CodeCellModel.defaultContentFactory;
        }
        /**
         * Create a new code cell.
         *
         * @param source - The data to use for the original source data.
         *
         * @returns A new code cell. If a source cell is provided, the
         *   new cell will be initialized with the data from the source.
         *   If the contentFactory is not provided, the instance
         *   `codeCellContentFactory` will be used.
         */
        createCodeCell(options) {
            if (!options.contentFactory) {
                options.contentFactory = this.codeCellContentFactory;
            }
            return new cells_1.CodeCellModel(options);
        }
        /**
         * Create a new raw cell.
         *
         * @param source - The data to use for the original source data.
         *
         * @returns A new raw cell. If a source cell is provided, the
         *   new cell will be initialized with the data from the source.
         */
        createRawCell(options) {
            return new cells_1.RawCellModel(options);
        }
    }
    CodeConsole.ModelFactory = ModelFactory;
    /**
     * The default `ModelFactory` instance.
     */
    CodeConsole.defaultModelFactory = new ModelFactory({});
})(CodeConsole = exports.CodeConsole || (exports.CodeConsole = {}));
/**
 * A namespace for console widget private data.
 */
var Private;
(function (Private) {
    /**
     * Jump to the bottom of a node.
     *
     * @param node - The scrollable element.
     */
    function scrollToBottom(node) {
        node.scrollTop = node.scrollHeight - node.clientHeight;
    }
    Private.scrollToBottom = scrollToBottom;
})(Private || (Private = {}));
