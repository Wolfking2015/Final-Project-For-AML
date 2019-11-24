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
const coreutils_1 = require("@jupyterlab/coreutils");
const signaling_1 = require("@phosphor/signaling");
const widgets_1 = require("@phosphor/widgets");
const React = __importStar(require("react"));
const ReactDOM = __importStar(require("react-dom"));
/**
 * A list of plugins with editable settings.
 */
class PluginList extends widgets_1.Widget {
    /**
     * Create a new plugin list.
     */
    constructor(options) {
        super();
        this._changed = new signaling_1.Signal(this);
        this._editor = 'raw';
        this._scrollTop = 0;
        this._selection = '';
        this.registry = options.registry;
        this.addClass('jp-PluginList');
        this._confirm = options.confirm;
        this.registry.pluginChanged.connect(() => {
            this.update();
        }, this);
    }
    /**
     * A signal emitted when a list user interaction happens.
     */
    get changed() {
        return this._changed;
    }
    /**
     * The editor type currently selected.
     */
    get editor() {
        return this._editor;
    }
    set editor(editor) {
        if (this._editor === editor) {
            return;
        }
        this._editor = editor;
        this.update();
    }
    /**
     * The selection value of the plugin list.
     */
    get scrollTop() {
        return this.node.querySelector('ul').scrollTop;
    }
    /**
     * The selection value of the plugin list.
     */
    get selection() {
        return this._selection;
    }
    set selection(selection) {
        if (this._selection === selection) {
            return;
        }
        this._selection = selection;
        this.update();
    }
    /**
     * Handle the DOM events for the widget.
     *
     * @param event - The DOM event sent to the widget.
     *
     * #### Notes
     * This method implements the DOM `EventListener` interface and is
     * called in response to events on the plugin list's node. It should
     * not be called directly by user code.
     */
    handleEvent(event) {
        switch (event.type) {
            case 'mousedown':
                this._evtMousedown(event);
                break;
            default:
                break;
        }
    }
    /**
     * Handle `'after-attach'` messages.
     */
    onAfterAttach(msg) {
        this.node.addEventListener('mousedown', this);
        this.update();
    }
    /**
     * Handle `before-detach` messages for the widget.
     */
    onBeforeDetach(msg) {
        this.node.removeEventListener('mousedown', this);
    }
    /**
     * Handle `'update-request'` messages.
     */
    onUpdateRequest(msg) {
        const { node, registry } = this;
        const type = this._editor;
        const selection = this._selection;
        Private.populateList(registry, type, selection, node);
        node.querySelector('ul').scrollTop = this._scrollTop;
    }
    /**
     * Handle the `'mousedown'` event for the plugin list.
     *
     * @param event - The DOM event sent to the widget
     */
    _evtMousedown(event) {
        event.preventDefault();
        let target = event.target;
        let id = target.getAttribute('data-id');
        if (id === this._selection) {
            return;
        }
        const editor = target.getAttribute('data-editor');
        if (editor) {
            this._editor = editor;
            this._changed.emit(undefined);
            this.update();
            return;
        }
        if (!id) {
            while (!id && target !== this.node) {
                target = target.parentElement;
                id = target.getAttribute('data-id');
            }
        }
        if (!id) {
            return;
        }
        this._confirm()
            .then(() => {
            this._scrollTop = this.scrollTop;
            this._selection = id;
            this._changed.emit(undefined);
            this.update();
        })
            .catch(() => {
            /* no op */
        });
    }
}
exports.PluginList = PluginList;
/**
 * A namespace for private module data.
 */
var Private;
(function (Private) {
    /**
     * Check the plugin for a rendering hint's value.
     *
     * #### Notes
     * The order of priority for overridden hints is as follows, from most
     * important to least:
     * 1. Data set by the end user in a settings file.
     * 2. Data set by the plugin author as a schema default.
     * 3. Data set by the plugin author as a top-level key of the schema.
     */
    function getHint(key, registry, plugin) {
        // First, give priority to checking if the hint exists in the user data.
        let hint = plugin.data.user[key];
        // Second, check to see if the hint exists in composite data, which folds
        // in default values from the schema.
        if (!hint) {
            hint = plugin.data.composite[key];
        }
        // Third, check to see if the plugin schema has defined the hint.
        if (!hint) {
            hint = plugin.schema[key];
        }
        // Finally, use the defaults from the registry schema.
        if (!hint) {
            const { properties } = registry.schema;
            hint = properties && properties[key] && properties[key].default;
        }
        return typeof hint === 'string' ? hint : '';
    }
    /**
     * Populate the plugin list.
     */
    function populateList(registry, type, selection, node) {
        const plugins = sortPlugins(registry.plugins);
        const items = plugins.map(plugin => {
            const itemTitle = `(${plugin.id}) ${plugin.schema.description}`;
            const image = getHint(coreutils_1.ICON_CLASS_KEY, registry, plugin);
            const iconClass = `jp-PluginList-icon${image ? ' ' + image : ''}`;
            const iconTitle = getHint(coreutils_1.ICON_LABEL_KEY, registry, plugin);
            return (React.createElement("li", { className: plugin.id === selection ? 'jp-mod-selected' : '', "data-id": plugin.id, key: plugin.id, title: itemTitle },
                React.createElement("span", { className: iconClass, title: iconTitle }),
                React.createElement("span", null, plugin.schema.title || plugin.id)));
        });
        ReactDOM.unmountComponentAtNode(node);
        ReactDOM.render(React.createElement(React.Fragment, null,
            React.createElement("div", { className: "jp-PluginList-switcher" },
                React.createElement("button", { "data-editor": "raw", disabled: type === 'raw' }, "Raw View"),
                React.createElement("button", { "data-editor": "table", disabled: type === 'table' }, "Table View")),
            React.createElement("ul", null, items)), node);
    }
    Private.populateList = populateList;
    /**
     * Sort a list of plugins by ID.
     */
    function sortPlugins(plugins) {
        return plugins.sort((a, b) => {
            return (a.schema.title || a.id).localeCompare(b.schema.title || b.id);
        });
    }
})(Private || (Private = {}));
