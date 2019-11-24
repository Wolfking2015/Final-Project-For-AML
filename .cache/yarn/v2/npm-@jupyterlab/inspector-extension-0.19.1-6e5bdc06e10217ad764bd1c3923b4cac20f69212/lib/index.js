"use strict";
// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
Object.defineProperty(exports, "__esModule", { value: true });
const application_1 = require("@jupyterlab/application");
const apputils_1 = require("@jupyterlab/apputils");
const console_1 = require("@jupyterlab/console");
const inspector_1 = require("@jupyterlab/inspector");
const notebook_1 = require("@jupyterlab/notebook");
const manager_1 = require("./manager");
/**
 * The command IDs used by the inspector plugin.
 */
var CommandIDs;
(function (CommandIDs) {
    CommandIDs.open = 'inspector:open';
})(CommandIDs || (CommandIDs = {}));
/**
 * A service providing code introspection.
 */
const inspector = {
    id: '@jupyterlab/inspector-extension:inspector',
    requires: [apputils_1.ICommandPalette, application_1.ILayoutRestorer],
    provides: inspector_1.IInspector,
    autoStart: true,
    activate: (app, palette, restorer) => {
        const { commands, shell } = app;
        const manager = new manager_1.InspectorManager();
        const category = 'Inspector';
        const command = CommandIDs.open;
        const label = 'Open Inspector';
        const namespace = 'inspector';
        const tracker = new apputils_1.InstanceTracker({
            namespace
        });
        /**
         * Create and track a new inspector.
         */
        function newInspectorPanel() {
            const inspector = new inspector_1.InspectorPanel();
            inspector.id = 'jp-inspector';
            inspector.title.label = 'Inspector';
            inspector.disposed.connect(() => {
                if (manager.inspector === inspector) {
                    manager.inspector = null;
                }
            });
            // Track the inspector.
            let widget = new apputils_1.MainAreaWidget({ content: inspector });
            tracker.add(widget);
            // Add the default inspector child items.
            Private.defaultInspectorItems.forEach(item => {
                inspector.add(item);
            });
            return inspector;
        }
        // Handle state restoration.
        restorer.restore(tracker, {
            command,
            args: () => null,
            name: () => 'inspector'
        });
        // Add command to registry and palette.
        commands.addCommand(command, {
            label,
            execute: () => {
                if (!manager.inspector || manager.inspector.isDisposed) {
                    manager.inspector = newInspectorPanel();
                }
                if (!manager.inspector.isAttached) {
                    shell.addToMainArea(manager.inspector.parent, { activate: false });
                }
                shell.activateById(manager.inspector.parent.id);
            }
        });
        palette.addItem({ command, category });
        return manager;
    }
};
/**
 * An extension that registers consoles for inspection.
 */
const consoles = {
    id: '@jupyterlab/inspector-extension:consoles',
    requires: [inspector_1.IInspector, console_1.IConsoleTracker],
    autoStart: true,
    activate: (app, manager, consoles) => {
        // Maintain association of new consoles with their respective handlers.
        const handlers = {};
        // Create a handler for each console that is created.
        consoles.widgetAdded.connect((sender, parent) => {
            const session = parent.console.session;
            const rendermime = parent.console.rendermime;
            const connector = new inspector_1.KernelConnector({ session });
            const handler = new inspector_1.InspectionHandler({ connector, rendermime });
            // Associate the handler to the widget.
            handlers[parent.id] = handler;
            // Set the initial editor.
            let cell = parent.console.promptCell;
            handler.editor = cell && cell.editor;
            // Listen for prompt creation.
            parent.console.promptCellCreated.connect((sender, cell) => {
                handler.editor = cell && cell.editor;
            });
            // Listen for parent disposal.
            parent.disposed.connect(() => {
                delete handlers[parent.id];
                handler.dispose();
            });
        });
        // Keep track of console instances and set inspector source.
        app.shell.currentChanged.connect((sender, args) => {
            let widget = args.newValue;
            if (!widget || !consoles.has(widget)) {
                return;
            }
            let source = handlers[widget.id];
            if (source) {
                manager.source = source;
            }
        });
        app.contextMenu.addItem({
            command: CommandIDs.open,
            selector: '.jp-CodeConsole-promptCell'
        });
    }
};
/**
 * An extension that registers notebooks for inspection.
 */
const notebooks = {
    id: '@jupyterlab/inspector-extension:notebooks',
    requires: [inspector_1.IInspector, notebook_1.INotebookTracker],
    autoStart: true,
    activate: (app, manager, notebooks) => {
        // Maintain association of new notebooks with their respective handlers.
        const handlers = {};
        // Create a handler for each notebook that is created.
        notebooks.widgetAdded.connect((sender, parent) => {
            const session = parent.session;
            const rendermime = parent.rendermime;
            const connector = new inspector_1.KernelConnector({ session });
            const handler = new inspector_1.InspectionHandler({ connector, rendermime });
            // Associate the handler to the widget.
            handlers[parent.id] = handler;
            // Set the initial editor.
            let cell = parent.content.activeCell;
            handler.editor = cell && cell.editor;
            // Listen for active cell changes.
            parent.content.activeCellChanged.connect((sender, cell) => {
                handler.editor = cell && cell.editor;
            });
            // Listen for parent disposal.
            parent.disposed.connect(() => {
                delete handlers[parent.id];
                handler.dispose();
            });
        });
        // Keep track of notebook instances and set inspector source.
        app.shell.currentChanged.connect((sender, args) => {
            let widget = args.newValue;
            if (!widget || !notebooks.has(widget)) {
                return;
            }
            let source = handlers[widget.id];
            if (source) {
                manager.source = source;
            }
        });
        app.contextMenu.addItem({
            command: CommandIDs.open,
            selector: '.jp-Notebook'
        });
    }
};
/**
 * Export the plugins as default.
 */
const plugins = [inspector, consoles, notebooks];
exports.default = plugins;
/**
 * A namespace for private data.
 */
var Private;
(function (Private) {
    /**
     * The default set of inspector items added to the inspector panel.
     */
    Private.defaultInspectorItems = [
        {
            className: 'jp-HintsInspectorItem',
            name: 'Hints',
            rank: 20,
            type: 'hints'
        }
    ];
})(Private || (Private = {}));
