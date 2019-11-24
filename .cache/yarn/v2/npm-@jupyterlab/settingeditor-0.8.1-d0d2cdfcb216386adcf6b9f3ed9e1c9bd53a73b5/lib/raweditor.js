"use strict";
// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
Object.defineProperty(exports, "__esModule", { value: true });
const apputils_1 = require("@jupyterlab/apputils");
const codeeditor_1 = require("@jupyterlab/codeeditor");
const signaling_1 = require("@phosphor/signaling");
const widgets_1 = require("@phosphor/widgets");
const inspector_1 = require("./inspector");
const splitpanel_1 = require("./splitpanel");
/**
 * A class name added to all raw editors.
 */
const RAW_EDITOR_CLASS = 'jp-SettingsRawEditor';
/**
 * A class name added to the user settings editor.
 */
const USER_CLASS = 'jp-SettingsRawEditor-user';
/**
 * A class name added to the user editor when there are validation errors.
 */
const ERROR_CLASS = 'jp-mod-error';
/**
 * The banner text for the default editor.
 */
const DEFAULT_TITLE = 'System Defaults';
/**
 * The banner text for the user settings editor.
 */
const USER_TITLE = 'User Overrides';
/**
 * A raw JSON settings editor.
 */
class RawEditor extends splitpanel_1.SplitPanel {
    /**
     * Create a new plugin editor.
     */
    constructor(options) {
        super({
            orientation: 'horizontal',
            renderer: splitpanel_1.SplitPanel.defaultRenderer,
            spacing: 1
        });
        this._canRevert = false;
        this._canSave = false;
        this._commandsChanged = new signaling_1.Signal(this);
        this._settings = null;
        this._toolbar = new apputils_1.Toolbar();
        const { commands, editorFactory, registry } = options;
        this.registry = registry;
        this._commands = commands;
        // Create read-only defaults editor.
        const defaults = (this._defaults = new codeeditor_1.CodeEditorWrapper({
            model: new codeeditor_1.CodeEditor.Model(),
            factory: editorFactory
        }));
        defaults.editor.model.value.text = '';
        defaults.editor.model.mimeType = 'text/javascript';
        defaults.editor.setOption('readOnly', true);
        // Create read-write user settings editor.
        const user = (this._user = new codeeditor_1.CodeEditorWrapper({
            model: new codeeditor_1.CodeEditor.Model(),
            factory: editorFactory,
            config: { lineNumbers: true }
        }));
        user.addClass(USER_CLASS);
        user.editor.model.mimeType = 'text/javascript';
        user.editor.model.value.changed.connect(this._onTextChanged, this);
        // Create and set up an inspector.
        this._inspector = inspector_1.createInspector(this, options.rendermime);
        this.addClass(RAW_EDITOR_CLASS);
        this._onSaveError = options.onSaveError;
        this.addWidget(Private.defaultsEditor(defaults));
        this.addWidget(Private.userEditor(user, this._toolbar, this._inspector));
    }
    /**
     * Whether the raw editor revert functionality is enabled.
     */
    get canRevert() {
        return this._canRevert;
    }
    /**
     * Whether the raw editor save functionality is enabled.
     */
    get canSave() {
        return this._canSave;
    }
    /**
     * Emits when the commands passed in at instantiation change.
     */
    get commandsChanged() {
        return this._commandsChanged;
    }
    /**
     * Whether the debug panel is visible.
     */
    get isDebugVisible() {
        return this._inspector.isVisible;
    }
    /**
     * Tests whether the settings have been modified and need saving.
     */
    get isDirty() {
        return this._user.editor.model.value.text !== this._settings.raw;
    }
    /**
     * The plugin settings being edited.
     */
    get settings() {
        return this._settings;
    }
    set settings(settings) {
        if (!settings && !this._settings) {
            return;
        }
        const samePlugin = settings && this._settings && settings.plugin === this._settings.plugin;
        if (samePlugin) {
            return;
        }
        const defaults = this._defaults;
        const user = this._user;
        // Disconnect old settings change handler.
        if (this._settings) {
            this._settings.changed.disconnect(this._onSettingsChanged, this);
        }
        if (settings) {
            this._settings = settings;
            this._settings.changed.connect(this._onSettingsChanged, this);
            this._onSettingsChanged();
        }
        else {
            this._settings = null;
            defaults.editor.model.value.text = '';
            user.editor.model.value.text = '';
        }
        this.update();
    }
    /**
     * Get the relative sizes of the two editor panels.
     */
    get sizes() {
        return this.relativeSizes();
    }
    set sizes(sizes) {
        this.setRelativeSizes(sizes);
    }
    /**
     * The inspectable source editor for user input.
     */
    get source() {
        return this._user.editor;
    }
    /**
     * Dispose of the resources held by the raw editor.
     */
    dispose() {
        if (this.isDisposed) {
            return;
        }
        super.dispose();
        this._defaults.dispose();
        this._user.dispose();
    }
    /**
     * Revert the editor back to original settings.
     */
    revert() {
        this._user.editor.model.value.text = this.settings.raw;
        this._updateToolbar(false, false);
    }
    /**
     * Save the contents of the raw editor.
     */
    save() {
        if (!this.isDirty) {
            return Promise.resolve(undefined);
        }
        const settings = this._settings;
        const source = this._user.editor.model.value.text;
        return settings
            .save(source)
            .then(() => {
            this._updateToolbar(false, false);
        })
            .catch(reason => {
            this._updateToolbar(true, false);
            this._onSaveError(reason);
        });
    }
    /**
     * Toggle the debug functionality.
     */
    toggleDebug() {
        const inspector = this._inspector;
        if (inspector.isHidden) {
            inspector.show();
        }
        else {
            inspector.hide();
        }
        this._updateToolbar();
    }
    /**
     * Handle `after-attach` messages.
     */
    onAfterAttach(msg) {
        Private.populateToolbar(this._commands, this._toolbar);
        this.update();
    }
    /**
     * Handle `'update-request'` messages.
     */
    onUpdateRequest(msg) {
        const settings = this._settings;
        const defaults = this._defaults;
        const user = this._user;
        if (settings) {
            defaults.editor.refresh();
            user.editor.refresh();
        }
    }
    /**
     * Handle text changes in the underlying editor.
     */
    _onTextChanged() {
        const raw = this._user.editor.model.value.text;
        const settings = this._settings;
        this.removeClass(ERROR_CLASS);
        // If there are no settings loaded or there are no changes, bail.
        if (!settings || settings.raw === raw) {
            this._updateToolbar(false, false);
            return;
        }
        const errors = settings.validate(raw);
        if (errors) {
            this.addClass(ERROR_CLASS);
            this._updateToolbar(true, false);
            return;
        }
        this._updateToolbar(true, true);
    }
    /**
     * Handle updates to the settings.
     */
    _onSettingsChanged() {
        const settings = this._settings;
        const defaults = this._defaults;
        const user = this._user;
        defaults.editor.model.value.text = settings.annotatedDefaults();
        user.editor.model.value.text = settings.raw;
    }
    _updateToolbar(revert = this._canRevert, save = this._canSave) {
        const commands = this._commands;
        this._canRevert = revert;
        this._canSave = save;
        this._commandsChanged.emit([
            commands.debug,
            commands.revert,
            commands.save
        ]);
    }
}
exports.RawEditor = RawEditor;
/**
 * A namespace for private module data.
 */
var Private;
(function (Private) {
    /**
     * Returns the wrapped setting defaults editor.
     */
    function defaultsEditor(editor) {
        const widget = new widgets_1.Widget();
        const layout = (widget.layout = new widgets_1.BoxLayout({ spacing: 0 }));
        const banner = new widgets_1.Widget();
        const bar = new apputils_1.Toolbar();
        banner.node.innerText = DEFAULT_TITLE;
        bar.insertItem(0, 'banner', banner);
        layout.addWidget(bar);
        layout.addWidget(editor);
        return widget;
    }
    Private.defaultsEditor = defaultsEditor;
    /**
     * Populate the raw editor toolbar.
     */
    function populateToolbar(commands, toolbar) {
        const { debug, registry, revert, save } = commands;
        toolbar.addItem('spacer', apputils_1.Toolbar.createSpacerItem());
        // Note the button order. The rationale here is that no matter what state
        // the toolbar is in, the relative location of the revert button in the
        // toolbar remains the same.
        [revert, debug, save].forEach(name => {
            const item = new apputils_1.CommandToolbarButton({ commands: registry, id: name });
            toolbar.addItem(name, item);
        });
    }
    Private.populateToolbar = populateToolbar;
    /**
     * Returns the wrapped user overrides editor.
     */
    function userEditor(editor, toolbar, inspector) {
        const widget = new widgets_1.Widget();
        const layout = (widget.layout = new widgets_1.BoxLayout({ spacing: 0 }));
        const banner = new widgets_1.Widget();
        banner.node.innerText = USER_TITLE;
        toolbar.insertItem(0, 'banner', banner);
        layout.addWidget(toolbar);
        layout.addWidget(editor);
        layout.addWidget(inspector);
        return widget;
    }
    Private.userEditor = userEditor;
})(Private || (Private = {}));
