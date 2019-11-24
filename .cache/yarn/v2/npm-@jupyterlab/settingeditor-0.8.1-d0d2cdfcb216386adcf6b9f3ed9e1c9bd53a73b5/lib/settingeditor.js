"use strict";
/*-----------------------------------------------------------------------------
| Copyright (c) Jupyter Development Team.
| Distributed under the terms of the Modified BSD License.
|----------------------------------------------------------------------------*/
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const coreutils_1 = require("@phosphor/coreutils");
const widgets_1 = require("@phosphor/widgets");
const React = __importStar(require("react"));
const ReactDOM = __importStar(require("react-dom"));
const plugineditor_1 = require("./plugineditor");
const pluginlist_1 = require("./pluginlist");
const splitpanel_1 = require("./splitpanel");
/**
 * The ratio panes in the setting editor.
 */
const DEFAULT_LAYOUT = {
    sizes: [1, 3],
    container: {
        editor: 'raw',
        plugin: '',
        sizes: [1, 1]
    }
};
/**
 * An interface for modifying and saving application settings.
 */
class SettingEditor extends widgets_1.Widget {
    /**
     * Create a new setting editor.
     */
    constructor(options) {
        super();
        this._fetching = null;
        this._saving = false;
        this._state = coreutils_1.JSONExt.deepCopy(DEFAULT_LAYOUT);
        this.addClass('jp-SettingEditor');
        this.key = options.key;
        this.state = options.state;
        const { commands, editorFactory, rendermime } = options;
        const layout = (this.layout = new widgets_1.PanelLayout());
        const registry = (this.registry = options.registry);
        const panel = (this._panel = new splitpanel_1.SplitPanel({
            orientation: 'horizontal',
            renderer: splitpanel_1.SplitPanel.defaultRenderer,
            spacing: 1
        }));
        const instructions = (this._instructions = new widgets_1.Widget());
        const editor = (this._editor = new plugineditor_1.PluginEditor({
            commands,
            editorFactory,
            registry,
            rendermime
        }));
        const confirm = () => editor.confirm();
        const list = (this._list = new pluginlist_1.PluginList({ confirm, registry }));
        const when = options.when;
        instructions.addClass('jp-SettingEditorInstructions');
        Private.populateInstructionsNode(instructions.node);
        if (when) {
            this._when = Array.isArray(when) ? Promise.all(when) : when;
        }
        panel.addClass('jp-SettingEditor-main');
        layout.addWidget(panel);
        panel.addWidget(list);
        panel.addWidget(instructions);
        splitpanel_1.SplitPanel.setStretch(list, 0);
        splitpanel_1.SplitPanel.setStretch(instructions, 1);
        splitpanel_1.SplitPanel.setStretch(editor, 1);
        editor.stateChanged.connect(this._onStateChanged, this);
        list.changed.connect(this._onStateChanged, this);
        panel.handleMoved.connect(this._onStateChanged, this);
    }
    /**
     * Whether the raw editor revert functionality is enabled.
     */
    get canRevertRaw() {
        return this._editor.raw.canRevert;
    }
    /**
     * Whether the raw editor save functionality is enabled.
     */
    get canSaveRaw() {
        return this._editor.raw.canSave;
    }
    /**
     * Emits when the commands passed in at instantiation change.
     */
    get commandsChanged() {
        return this._editor.raw.commandsChanged;
    }
    /**
     * Whether the debug panel is visible.
     */
    get isDebugVisible() {
        return this._editor.raw.isDebugVisible;
    }
    /**
     * The currently loaded settings.
     */
    get settings() {
        return this._editor.settings;
    }
    /**
     * The inspectable raw user editor source for the currently loaded settings.
     */
    get source() {
        return this._editor.raw.source;
    }
    /**
     * Dispose of the resources held by the setting editor.
     */
    dispose() {
        if (this.isDisposed) {
            return;
        }
        super.dispose();
        this._editor.dispose();
        this._instructions.dispose();
        this._list.dispose();
        this._panel.dispose();
    }
    /**
     * Revert raw editor back to original settings.
     */
    revert() {
        this._editor.raw.revert();
    }
    /**
     * Save the contents of the raw editor.
     */
    save() {
        return this._editor.raw.save();
    }
    /**
     * Toggle the debug functionality.
     */
    toggleDebug() {
        this._editor.raw.toggleDebug();
    }
    /**
     * Handle `'after-attach'` messages.
     */
    onAfterAttach(msg) {
        super.onAfterAttach(msg);
        this._panel.hide();
        this._fetchState()
            .then(() => {
            this._panel.show();
            this._setState();
        })
            .catch(reason => {
            console.error('Fetching setting editor state failed', reason);
            this._panel.show();
            this._setState();
        });
    }
    /**
     * Handle `'close-request'` messages.
     */
    onCloseRequest(msg) {
        this._editor
            .confirm()
            .then(() => {
            super.onCloseRequest(msg);
            this.dispose();
        })
            .catch(() => {
            /* no op */
        });
    }
    /**
     * Get the state of the panel.
     */
    _fetchState() {
        if (this._fetching) {
            return this._fetching;
        }
        const { key, state } = this;
        const promises = [state.fetch(key), this._when];
        return (this._fetching = Promise.all(promises).then(([saved]) => {
            this._fetching = null;
            if (this._saving) {
                return;
            }
            this._state = Private.normalizeState(saved, this._state);
        }));
    }
    /**
     * Handle root level layout state changes.
     */
    _onStateChanged() {
        this._state.sizes = this._panel.relativeSizes();
        this._state.container = this._editor.state;
        this._state.container.editor = this._list.editor;
        this._state.container.plugin = this._list.selection;
        this._saveState()
            .then(() => {
            this._setState();
        })
            .catch(reason => {
            console.error('Saving setting editor state failed', reason);
            this._setState();
        });
    }
    /**
     * Set the state of the setting editor.
     */
    _saveState() {
        const { key, state } = this;
        const value = this._state;
        this._saving = true;
        return state
            .save(key, value)
            .then(() => {
            this._saving = false;
        })
            .catch((reason) => {
            this._saving = false;
            throw reason;
        });
    }
    /**
     * Set the layout sizes.
     */
    _setLayout() {
        const editor = this._editor;
        const panel = this._panel;
        const state = this._state;
        editor.state = state.container;
        // Allow the message queue (which includes fit requests that might disrupt
        // setting relative sizes) to clear before setting sizes.
        requestAnimationFrame(() => {
            panel.setRelativeSizes(state.sizes);
        });
    }
    /**
     * Set the presets of the setting editor.
     */
    _setState() {
        const editor = this._editor;
        const list = this._list;
        const panel = this._panel;
        const { container } = this._state;
        if (!container.plugin) {
            editor.settings = null;
            list.selection = '';
            this._setLayout();
            return;
        }
        if (editor.settings && editor.settings.plugin === container.plugin) {
            this._setLayout();
            return;
        }
        const instructions = this._instructions;
        this.registry
            .load(container.plugin)
            .then(settings => {
            if (instructions.isAttached) {
                instructions.parent = null;
            }
            if (!editor.isAttached) {
                panel.addWidget(editor);
            }
            editor.settings = settings;
            list.editor = container.editor;
            list.selection = container.plugin;
            this._setLayout();
        })
            .catch((reason) => {
            console.error(`Loading settings failed: ${reason.message}`);
            list.selection = this._state.container.plugin = '';
            editor.settings = null;
            this._setLayout();
        });
    }
}
exports.SettingEditor = SettingEditor;
/**
 * A namespace for private module data.
 */
var Private;
(function (Private) {
    /**
     * Populate the instructions text node.
     */
    function populateInstructionsNode(node) {
        const iconClass = `jp-SettingEditorInstructions-icon jp-JupyterIcon`;
        ReactDOM.render(React.createElement(React.Fragment, null,
            React.createElement("h2", null,
                React.createElement("span", { className: iconClass }),
                React.createElement("span", { className: "jp-SettingEditorInstructions-title" }, "Settings")),
            React.createElement("span", { className: "jp-SettingEditorInstructions-text" }, "Select a plugin from the list to view and edit its preferences.")), node);
    }
    Private.populateInstructionsNode = populateInstructionsNode;
    /**
     * Return a normalized restored layout state that defaults to the presets.
     */
    function normalizeState(saved, current) {
        if (!saved) {
            return coreutils_1.JSONExt.deepCopy(DEFAULT_LAYOUT);
        }
        if (!('sizes' in saved) || !numberArray(saved.sizes)) {
            saved.sizes = coreutils_1.JSONExt.deepCopy(DEFAULT_LAYOUT.sizes);
        }
        if (!('container' in saved)) {
            saved.container = coreutils_1.JSONExt.deepCopy(DEFAULT_LAYOUT.container);
            return saved;
        }
        const container = 'container' in saved &&
            saved.container &&
            typeof saved.container === 'object'
            ? saved.container
            : {};
        saved.container = {
            editor: container.editor === 'raw' || container.editor === 'table'
                ? container.editor
                : DEFAULT_LAYOUT.container.editor,
            plugin: typeof container.plugin === 'string'
                ? container.plugin
                : DEFAULT_LAYOUT.container.plugin,
            sizes: numberArray(container.sizes)
                ? container.sizes
                : coreutils_1.JSONExt.deepCopy(DEFAULT_LAYOUT.container.sizes)
        };
        return saved;
    }
    Private.normalizeState = normalizeState;
    /**
     * Tests whether an array consists exclusively of numbers.
     */
    function numberArray(value) {
        return Array.isArray(value) && value.every(x => typeof x === 'number');
    }
})(Private || (Private = {}));
