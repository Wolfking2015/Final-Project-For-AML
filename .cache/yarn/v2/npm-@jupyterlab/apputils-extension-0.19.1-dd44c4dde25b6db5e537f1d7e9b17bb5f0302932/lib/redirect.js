"use strict";
/*-----------------------------------------------------------------------------
| Copyright (c) Jupyter Development Team.
| Distributed under the terms of the Modified BSD License.
|----------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const widgets_1 = require("@phosphor/widgets");
/**
 * The form label.
 */
const LABEL = `This workspace is already in use in another JupyterLab window.
  Please enter another workspace name.`;
/**
 * The form input field placeholder.
 */
const PLACEHOLDER = 'url-friendly-workspace-name';
/**
 * The form warning message if an empty value was submitted.
 */
const WARNING = 'Please enter a value.';
/**
 * The UI for the recovery option to redirect to a different workspace.
 */
class RedirectForm extends widgets_1.Widget {
    /**
     * Create a redirect form.
     */
    constructor() {
        super({ node: Private.createNode() });
    }
    /**
     * The text label of the form.
     */
    get label() {
        return this.node.querySelector('label span').textContent;
    }
    set label(label) {
        this.node.querySelector('label span').textContent = label;
    }
    /**
     * The input placeholder.
     */
    get placeholder() {
        return this.node.querySelector('input').placeholder;
    }
    set placeholder(placeholder) {
        this.node.querySelector('input').placeholder = placeholder;
    }
    /**
     * The warning message.
     */
    get warning() {
        return this.node.querySelector('.jp-RedirectForm-warning').textContent;
    }
    set warning(warning) {
        this.node.querySelector('.jp-RedirectForm-warning').textContent = warning;
    }
    /**
     * Returns the input value.
     */
    getValue() {
        return encodeURIComponent(this.node.querySelector('input').value);
    }
}
exports.RedirectForm = RedirectForm;
/**
 * Return a new redirect form, populated with default language.
 */
function createRedirectForm(warn = false) {
    const form = new RedirectForm();
    form.label = LABEL;
    form.placeholder = PLACEHOLDER;
    form.warning = warn ? WARNING : '';
    return form;
}
exports.createRedirectForm = createRedirectForm;
/**
 * A namespace for private module data.
 */
var Private;
(function (Private) {
    /**
     * Create the redirect form's content.
     */
    function createNode() {
        const node = document.createElement('div');
        const label = document.createElement('label');
        const input = document.createElement('input');
        const text = document.createElement('span');
        const warning = document.createElement('div');
        node.className = 'jp-RedirectForm';
        warning.className = 'jp-RedirectForm-warning';
        label.appendChild(text);
        label.appendChild(input);
        node.appendChild(label);
        node.appendChild(warning);
        return node;
    }
    Private.createNode = createNode;
})(Private || (Private = {}));
