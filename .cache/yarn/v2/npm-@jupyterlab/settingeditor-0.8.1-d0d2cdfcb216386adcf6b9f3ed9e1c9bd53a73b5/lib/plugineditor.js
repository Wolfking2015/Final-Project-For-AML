"use strict";
/*-----------------------------------------------------------------------------
| Copyright (c) Jupyter Development Team.
| Distributed under the terms of the Modified BSD License.
|----------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const apputils_1 = require("@jupyterlab/apputils");
const coreutils_1 = require("@phosphor/coreutils");
const signaling_1 = require("@phosphor/signaling");
const widgets_1 = require("@phosphor/widgets");
const raweditor_1 = require("./raweditor");
const tableeditor_1 = require("./tableeditor");
/**
 * The class name added to all plugin editors.
 */
const PLUGIN_EDITOR_CLASS = 'jp-PluginEditor';
/**
 * An individual plugin settings editor.
 */
class PluginEditor extends widgets_1.Widget {
    /**
     * Create a new plugin editor.
     *
     * @param options - The plugin editor instantiation options.
     */
    constructor(options) {
        super();
        this._editor = 'raw';
        this._settings = null;
        this._stateChanged = new signaling_1.Signal(this);
        this.addClass(PLUGIN_EDITOR_CLASS);
        const { commands, editorFactory, registry, rendermime } = options;
        const layout = (this.layout = new widgets_1.StackedLayout());
        const { onSaveError } = Private;
        this.raw = this._rawEditor = new raweditor_1.RawEditor({
            commands,
            editorFactory,
            onSaveError,
            registry,
            rendermime
        });
        this.table = this._tableEditor = new tableeditor_1.TableEditor({ onSaveError });
        this._rawEditor.handleMoved.connect(this._onStateChanged, this);
        layout.addWidget(this._rawEditor);
        layout.addWidget(this._tableEditor);
    }
    /**
     * Tests whether the settings have been modified and need saving.
     */
    get isDirty() {
        return this._rawEditor.isDirty || this._tableEditor.isDirty;
    }
    /**
     * The plugin settings being edited.
     */
    get settings() {
        return this._settings;
    }
    set settings(settings) {
        if (this._settings === settings) {
            return;
        }
        const raw = this._rawEditor;
        const table = this._tableEditor;
        this._settings = raw.settings = table.settings = settings;
        this.update();
    }
    /**
     * The plugin editor layout state.
     */
    get state() {
        const editor = this._editor;
        const plugin = this._settings ? this._settings.plugin : '';
        const { sizes } = this._rawEditor;
        return { editor, plugin, sizes };
    }
    set state(state) {
        if (coreutils_1.JSONExt.deepEqual(this.state, state)) {
            return;
        }
        this._editor = state.editor;
        this._rawEditor.sizes = state.sizes;
        this.update();
    }
    /**
     * A signal that emits when editor layout state changes and needs to be saved.
     */
    get stateChanged() {
        return this._stateChanged;
    }
    /**
     * If the editor is in a dirty state, confirm that the user wants to leave.
     */
    confirm() {
        if (this.isHidden || !this.isAttached || !this.isDirty) {
            return Promise.resolve(undefined);
        }
        return apputils_1.showDialog({
            title: 'You have unsaved changes.',
            body: 'Do you want to leave without saving?',
            buttons: [apputils_1.Dialog.cancelButton(), apputils_1.Dialog.okButton()]
        }).then(result => {
            if (!result.button.accept) {
                throw new Error('User canceled.');
            }
        });
    }
    /**
     * Dispose of the resources held by the plugin editor.
     */
    dispose() {
        if (this.isDisposed) {
            return;
        }
        super.dispose();
        this._rawEditor.dispose();
        this._tableEditor.dispose();
    }
    /**
     * Handle `after-attach` messages.
     */
    onAfterAttach(msg) {
        this.update();
    }
    /**
     * Handle `'update-request'` messages.
     */
    onUpdateRequest(msg) {
        const editor = this._editor;
        const raw = this._rawEditor;
        const table = this._tableEditor;
        const settings = this._settings;
        if (!settings) {
            this.hide();
            return;
        }
        this.show();
        (editor === 'raw' ? table : raw).hide();
        (editor === 'raw' ? raw : table).show();
    }
    /**
     * Handle layout state changes that need to be saved.
     */
    _onStateChanged() {
        this.stateChanged.emit(undefined);
    }
}
exports.PluginEditor = PluginEditor;
/**
 * A namespace for private module data.
 */
var Private;
(function (Private) {
    /**
     * Handle save errors.
     */
    function onSaveError(reason) {
        console.error(`Saving setting editor value failed: ${reason.message}`);
        apputils_1.showDialog({
            title: 'Your changes were not saved.',
            body: reason.message,
            buttons: [apputils_1.Dialog.okButton()]
        });
    }
    Private.onSaveError = onSaveError;
})(Private || (Private = {}));
