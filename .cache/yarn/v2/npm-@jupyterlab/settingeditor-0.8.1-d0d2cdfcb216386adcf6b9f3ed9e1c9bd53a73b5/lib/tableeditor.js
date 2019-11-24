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
const widgets_1 = require("@phosphor/widgets");
const React = __importStar(require("react"));
const ReactDOM = __importStar(require("react-dom"));
/**
 * A tabular editor for plugin settings.
 */
class TableEditor extends widgets_1.Widget {
    /**
     * Create a new table editor for settings.
     */
    constructor(options) {
        super({ node: document.createElement('fieldset') });
        this._settings = null;
        this.addClass('jp-SettingsTableEditor');
    }
    /**
     * Tests whether the settings have been modified and need saving.
     */
    get isDirty() {
        return false; // TODO: remove placeholder.
    }
    /**
     * The plugin settings.
     */
    get settings() {
        return this._settings;
    }
    set settings(settings) {
        if (this._settings) {
            this._settings.changed.disconnect(this._onSettingsChanged, this);
        }
        this._settings = settings;
        if (this._settings) {
            this._settings.changed.connect(this._onSettingsChanged, this);
        }
        this.update();
    }
    /**
     * Handle `'update-request'` messages.
     */
    onUpdateRequest(msg) {
        const settings = this._settings;
        // Populate if possible.
        if (settings) {
            Private.populateTable(this.node, settings);
        }
    }
    /**
     * Handle setting changes.
     */
    _onSettingsChanged() {
        this.update();
    }
}
exports.TableEditor = TableEditor;
/**
 * A namespace for private module data.
 */
var Private;
(function (Private) {
    /**
     * Populate the fieldset with a specific plugin's metadata.
     */
    function populateTable(node, settings) {
        const { plugin, schema } = settings;
        const fields = {};
        const properties = schema.properties || {};
        const title = `(${plugin}) ${schema.description}`;
        const label = `Fields - ${schema.title || plugin}`;
        Object.keys(properties).forEach(property => {
            const field = properties[property];
            const { type } = field;
            const defaultValue = settings.default(property);
            const title = field.title || property;
            const value = JSON.stringify(defaultValue) || '';
            const valueTitle = JSON.stringify(defaultValue, null, 4);
            fields[property] = (React.createElement("tr", { key: property },
                React.createElement("td", { className: "jp-SettingsTableEditor-key", title: title },
                    React.createElement("code", { title: title }, property)),
                React.createElement("td", { className: "jp-SettingsTableEditor-value", title: valueTitle },
                    React.createElement("code", { title: valueTitle }, value)),
                React.createElement("td", { className: "jp-SettingsTableEditor-type" }, type)));
        });
        const rows = Object.keys(fields)
            .sort((a, b) => a.localeCompare(b))
            .map(property => fields[property]);
        const fragment = (React.createElement(React.Fragment, null,
            React.createElement("legend", { title: title }, label),
            React.createElement("div", { className: "jp-SettingsTableEditor-wrapper" },
                React.createElement("table", null,
                    React.createElement("thead", null,
                        React.createElement("tr", null,
                            React.createElement("th", { className: "jp-SettingsTableEditor-key" }, "Key"),
                            React.createElement("th", { className: "jp-SettingsTableEditor-value" }, "Default"),
                            React.createElement("th", { className: "jp-SettingsTableEditor-type" }, "Type"))),
                    React.createElement("tbody", null, rows)))));
        ReactDOM.unmountComponentAtNode(node);
        ReactDOM.render(fragment, node);
    }
    Private.populateTable = populateTable;
})(Private || (Private = {}));
