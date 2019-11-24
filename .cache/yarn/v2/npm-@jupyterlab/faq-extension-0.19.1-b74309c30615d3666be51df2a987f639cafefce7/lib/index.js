"use strict";
// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
Object.defineProperty(exports, "__esModule", { value: true });
const application_1 = require("@jupyterlab/application");
const apputils_1 = require("@jupyterlab/apputils");
const rendermime_1 = require("@jupyterlab/rendermime");
const coreutils_1 = require("@phosphor/coreutils");
require("../style/index.css");
/**
 * The command IDs used by the FAQ plugin.
 */
var CommandIDs;
(function (CommandIDs) {
    CommandIDs.open = 'faq-jupyterlab:open';
})(CommandIDs || (CommandIDs = {}));
/**
 * The FAQ page extension.
 */
const plugin = {
    activate,
    id: '@jupyterlab/faq-extension:plugin',
    requires: [apputils_1.ICommandPalette, application_1.ILayoutRestorer, rendermime_1.IRenderMimeRegistry],
    autoStart: true
};
/**
 * Export the plugin as default.
 */
exports.default = plugin;
/* tslint:disable */
/**
 * The faq page source.
 */
const SOURCE = require('../faq.md');
/* tslint:enable */
/**
 * Activate the FAQ plugin.
 */
function activate(app, palette, restorer, rendermime) {
    const category = 'Help';
    const command = CommandIDs.open;
    const { commands, shell } = app;
    const tracker = new apputils_1.InstanceTracker({ namespace: 'faq' });
    // Handle state restoration.
    restorer.restore(tracker, {
        command,
        args: () => coreutils_1.JSONExt.emptyObject,
        name: () => 'faq'
    });
    let createWidget = () => {
        let content = rendermime.createRenderer('text/markdown');
        const model = rendermime.createModel({
            data: { 'text/markdown': SOURCE }
        });
        content.renderModel(model);
        content.addClass('jp-FAQ-content');
        let widget = new apputils_1.MainAreaWidget({ content });
        widget.addClass('jp-FAQ');
        widget.title.label = 'FAQ';
        return widget;
    };
    let widget;
    commands.addCommand(command, {
        label: 'Open FAQ',
        execute: () => {
            if (!widget || widget.isDisposed) {
                widget = createWidget();
            }
            if (!tracker.has(widget)) {
                tracker.add(widget);
                shell.addToMainArea(widget, { activate: false });
            }
            shell.activateById(widget.id);
        }
    });
    palette.addItem({ command, category });
}
