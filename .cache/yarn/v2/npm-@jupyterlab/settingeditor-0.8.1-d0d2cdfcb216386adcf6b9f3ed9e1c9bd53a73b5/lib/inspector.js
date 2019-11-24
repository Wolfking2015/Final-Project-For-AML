"use strict";
/*-----------------------------------------------------------------------------
| Copyright (c) Jupyter Development Team.
| Distributed under the terms of the Modified BSD License.
|----------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const coreutils_1 = require("@jupyterlab/coreutils");
const inspector_1 = require("@jupyterlab/inspector");
const rendermime_1 = require("@jupyterlab/rendermime");
/**
 * Create a raw editor inspector.
 */
function createInspector(editor, rendermime) {
    const connector = new InspectorConnector(editor);
    const inspector = new inspector_1.InspectorPanel();
    const handler = new inspector_1.InspectionHandler({
        connector,
        rendermime: rendermime ||
            new rendermime_1.RenderMimeRegistry({
                initialFactories: rendermime_1.standardRendererFactories
            })
    });
    inspector.add({
        className: 'jp-SettingsDebug',
        name: 'Debug',
        rank: 0,
        type: 'hints'
    });
    inspector.source = handler;
    handler.editor = editor.source;
    return inspector;
}
exports.createInspector = createInspector;
/**
 * The data connector used to populate a code inspector.
 *
 * #### Notes
 * This data connector debounces fetch requests to throttle them at no more than
 * one request per 100ms. This means that using the connector to populate
 * multiple client objects can lead to missed fetch responses.
 */
class InspectorConnector extends coreutils_1.DataConnector {
    constructor(editor) {
        super();
        this._current = 0;
        this._editor = editor;
    }
    /**
     * Fetch inspection requests.
     */
    fetch(request) {
        return new Promise(resolve => {
            // Debounce requests at a rate of 100ms.
            const current = (this._current = window.setTimeout(() => {
                if (current !== this._current) {
                    return resolve(null);
                }
                const errors = this._validate(request.text);
                if (!errors) {
                    return resolve(null);
                }
                resolve({ data: Private.render(errors), metadata: {} });
            }, 100));
        });
    }
    _validate(raw) {
        const editor = this._editor;
        const data = { composite: {}, user: {} };
        const id = editor.settings.plugin;
        const schema = editor.settings.schema;
        const validator = editor.registry.validator;
        return validator.validateData({ data, id, raw, schema }, false);
    }
}
/**
 * A namespace for private module data.
 */
var Private;
(function (Private) {
    /**
     * Render validation errors as an HTML string.
     */
    function render(errors) {
        return { 'text/markdown': errors.map(renderError).join('') };
    }
    Private.render = render;
    /**
     * Render an individual validation error as a markdown string.
     */
    function renderError(error) {
        switch (error.keyword) {
            case 'additionalProperties':
                return `**\`[additional property error]\`**
          \`${error.params.additionalProperty}\` is not a valid property`;
            case 'syntax':
                return `**\`[syntax error]\`** *${error.message}*`;
            case 'type':
                return `**\`[type error]\`**
          \`${error.dataPath}\` ${error.message}`;
            default:
                return `**\`[error]\`** *${error.message}*`;
        }
    }
})(Private || (Private = {}));
