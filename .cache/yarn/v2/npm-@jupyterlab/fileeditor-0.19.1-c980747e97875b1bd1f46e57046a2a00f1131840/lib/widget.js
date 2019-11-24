"use strict";
// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
Object.defineProperty(exports, "__esModule", { value: true });
const widgets_1 = require("@phosphor/widgets");
const docregistry_1 = require("@jupyterlab/docregistry");
const codeeditor_1 = require("@jupyterlab/codeeditor");
const coreutils_1 = require("@phosphor/coreutils");
/**
 * The data attribute added to a widget that can run code.
 */
const CODE_RUNNER = 'jpCodeRunner';
/**
 * The data attribute added to a widget that can undo.
 */
const UNDOER = 'jpUndoer';
/**
 * A code editor wrapper for the file editor.
 */
class FileEditorCodeWrapper extends codeeditor_1.CodeEditorWrapper {
    /**
     * Construct a new editor widget.
     */
    constructor(options) {
        super({
            factory: options.factory,
            model: options.context.model
        });
        this._ready = new coreutils_1.PromiseDelegate();
        const context = (this._context = options.context);
        const editor = this.editor;
        this.addClass('jp-FileEditorCodeWrapper');
        this.node.dataset[CODE_RUNNER] = 'true';
        this.node.dataset[UNDOER] = 'true';
        editor.model.value.text = context.model.toString();
        context.ready.then(() => {
            this._onContextReady();
        });
        if (context.model.modelDB.isCollaborative) {
            let modelDB = context.model.modelDB;
            modelDB.connected.then(() => {
                let collaborators = modelDB.collaborators;
                if (!collaborators) {
                    return;
                }
                // Setup the selection style for collaborators
                let localCollaborator = collaborators.localCollaborator;
                this.editor.uuid = localCollaborator.sessionId;
                this.editor.selectionStyle = Object.assign({}, codeeditor_1.CodeEditor.defaultSelectionStyle, { color: localCollaborator.color });
                collaborators.changed.connect(this._onCollaboratorsChanged, this);
                // Trigger an initial onCollaboratorsChanged event.
                this._onCollaboratorsChanged();
            });
        }
    }
    /**
     * Get the context for the editor widget.
     */
    get context() {
        return this._context;
    }
    /**
     * A promise that resolves when the file editor is ready.
     */
    get ready() {
        return this._ready.promise;
    }
    /**
     * Handle actions that should be taken when the context is ready.
     */
    _onContextReady() {
        if (this.isDisposed) {
            return;
        }
        const contextModel = this._context.model;
        const editor = this.editor;
        const editorModel = editor.model;
        // Set the editor model value.
        editorModel.value.text = contextModel.toString();
        // Prevent the initial loading from disk from being in the editor history.
        editor.clearHistory();
        // Wire signal connections.
        contextModel.contentChanged.connect(this._onContentChanged, this);
        // Resolve the ready promise.
        this._ready.resolve(undefined);
    }
    /**
     * Handle a change in context model content.
     */
    _onContentChanged() {
        const editorModel = this.editor.model;
        const oldValue = editorModel.value.text;
        const newValue = this._context.model.toString();
        if (oldValue !== newValue) {
            editorModel.value.text = newValue;
        }
    }
    /**
     * Handle a change to the collaborators on the model
     * by updating UI elements associated with them.
     */
    _onCollaboratorsChanged() {
        // If there are selections corresponding to non-collaborators,
        // they are stale and should be removed.
        let collaborators = this._context.model.modelDB.collaborators;
        if (!collaborators) {
            return;
        }
        for (let key of this.editor.model.selections.keys()) {
            if (!collaborators.has(key)) {
                this.editor.model.selections.delete(key);
            }
        }
    }
}
exports.FileEditorCodeWrapper = FileEditorCodeWrapper;
/**
 * A widget for editors.
 */
class FileEditor extends widgets_1.Widget {
    /**
     * Construct a new editor widget.
     */
    constructor(options) {
        super();
        this.addClass('jp-FileEditor');
        const context = (this._context = options.context);
        this._mimeTypeService = options.mimeTypeService;
        let editorWidget = (this.editorWidget = new FileEditorCodeWrapper(options));
        this.editor = editorWidget.editor;
        this.model = editorWidget.model;
        // Listen for changes to the path.
        context.pathChanged.connect(this._onPathChanged, this);
        this._onPathChanged();
        let layout = (this.layout = new widgets_1.StackedLayout());
        layout.addWidget(editorWidget);
    }
    /**
     * Get the context for the editor widget.
     */
    get context() {
        return this.editorWidget.context;
    }
    /**
     * A promise that resolves when the file editor is ready.
     */
    get ready() {
        return this.editorWidget.ready;
    }
    /**
     * Handle the DOM events for the widget.
     *
     * @param event - The DOM event sent to the widget.
     *
     * #### Notes
     * This method implements the DOM `EventListener` interface and is
     * called in response to events on the widget's node. It should
     * not be called directly by user code.
     */
    handleEvent(event) {
        if (!this.model) {
            return;
        }
        switch (event.type) {
            case 'mousedown':
                this._ensureFocus();
                break;
            default:
                break;
        }
    }
    /**
     * Handle `after-attach` messages for the widget.
     */
    onAfterAttach(msg) {
        super.onAfterAttach(msg);
        let node = this.node;
        node.addEventListener('mousedown', this);
    }
    /**
     * Handle `before-detach` messages for the widget.
     */
    onBeforeDetach(msg) {
        let node = this.node;
        node.removeEventListener('mousedown', this);
    }
    /**
     * Handle `'activate-request'` messages.
     */
    onActivateRequest(msg) {
        this._ensureFocus();
    }
    /**
     * Ensure that the widget has focus.
     */
    _ensureFocus() {
        if (!this.editor.hasFocus()) {
            this.editor.focus();
        }
    }
    /**
     * Handle a change to the path.
     */
    _onPathChanged() {
        const editor = this.editor;
        const localPath = this._context.localPath;
        editor.model.mimeType = this._mimeTypeService.getMimeTypeByFilePath(localPath);
    }
}
exports.FileEditor = FileEditor;
/**
 * A widget factory for editors.
 */
class FileEditorFactory extends docregistry_1.ABCWidgetFactory {
    /**
     * Construct a new editor widget factory.
     */
    constructor(options) {
        super(options.factoryOptions);
        this._services = options.editorServices;
    }
    /**
     * Create a new widget given a context.
     */
    createNewWidget(context) {
        let func = this._services.factoryService.newDocumentEditor;
        let factory = options => {
            return func(options);
        };
        const content = new FileEditor({
            factory,
            context,
            mimeTypeService: this._services.mimeTypeService
        });
        const widget = new docregistry_1.DocumentWidget({ content, context });
        return widget;
    }
}
exports.FileEditorFactory = FileEditorFactory;
