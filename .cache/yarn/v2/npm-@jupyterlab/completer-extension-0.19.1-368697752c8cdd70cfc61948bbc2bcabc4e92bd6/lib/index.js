"use strict";
// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
Object.defineProperty(exports, "__esModule", { value: true });
const completer_1 = require("@jupyterlab/completer");
const console_1 = require("@jupyterlab/console");
const fileeditor_1 = require("@jupyterlab/fileeditor");
const notebook_1 = require("@jupyterlab/notebook");
const services_1 = require("@jupyterlab/services");
const algorithm_1 = require("@phosphor/algorithm");
const widgets_1 = require("@phosphor/widgets");
/**
 * The command IDs used by the completer plugin.
 */
var CommandIDs;
(function (CommandIDs) {
    CommandIDs.invoke = 'completer:invoke';
    CommandIDs.invokeConsole = 'completer:invoke-console';
    CommandIDs.invokeNotebook = 'completer:invoke-notebook';
    CommandIDs.invokeFile = 'completer:invoke-file';
    CommandIDs.select = 'completer:select';
    CommandIDs.selectConsole = 'completer:select-console';
    CommandIDs.selectNotebook = 'completer:select-notebook';
    CommandIDs.selectFile = 'completer:select-file';
})(CommandIDs || (CommandIDs = {}));
/**
 * A plugin providing code completion for editors.
 */
const manager = {
    id: '@jupyterlab/completer-extension:manager',
    autoStart: true,
    provides: completer_1.ICompletionManager,
    activate: (app) => {
        const handlers = {};
        app.commands.addCommand(CommandIDs.invoke, {
            execute: args => {
                let id = args && args['id'];
                if (!id) {
                    return;
                }
                const handler = handlers[id];
                if (handler) {
                    handler.invoke();
                }
            }
        });
        app.commands.addCommand(CommandIDs.select, {
            execute: args => {
                let id = args && args['id'];
                if (!id) {
                    return;
                }
                const handler = handlers[id];
                if (handler) {
                    handler.completer.selectActive();
                }
            }
        });
        return {
            register: (completable) => {
                const { connector, editor, parent } = completable;
                const model = new completer_1.CompleterModel();
                const completer = new completer_1.Completer({ editor, model });
                const handler = new completer_1.CompletionHandler({ completer, connector });
                const id = parent.id;
                // Hide the widget when it first loads.
                completer.hide();
                // Associate the handler with the parent widget.
                handlers[id] = handler;
                // Set the handler's editor.
                handler.editor = editor;
                // Attach the completer widget.
                widgets_1.Widget.attach(completer, document.body);
                // Listen for parent disposal.
                parent.disposed.connect(() => {
                    delete handlers[id];
                    model.dispose();
                    completer.dispose();
                    handler.dispose();
                });
                return handler;
            }
        };
    }
};
/**
 * An extension that registers consoles for code completion.
 */
const consoles = {
    id: '@jupyterlab/completer-extension:consoles',
    requires: [completer_1.ICompletionManager, console_1.IConsoleTracker],
    autoStart: true,
    activate: (app, manager, consoles) => {
        // Create a handler for each console that is created.
        consoles.widgetAdded.connect((sender, panel) => {
            const anchor = panel.console;
            const cell = anchor.promptCell;
            const editor = cell && cell.editor;
            const session = anchor.session;
            const parent = panel;
            const connector = new completer_1.CompletionConnector({ session, editor });
            const handler = manager.register({ connector, editor, parent });
            // Listen for prompt creation.
            anchor.promptCellCreated.connect((sender, cell) => {
                const editor = cell && cell.editor;
                handler.editor = editor;
                handler.connector = new completer_1.CompletionConnector({ session, editor });
            });
        });
        // Add console completer invoke command.
        app.commands.addCommand(CommandIDs.invokeConsole, {
            execute: () => {
                const id = consoles.currentWidget && consoles.currentWidget.id;
                if (id) {
                    return app.commands.execute(CommandIDs.invoke, { id });
                }
            }
        });
        // Add console completer select command.
        app.commands.addCommand(CommandIDs.selectConsole, {
            execute: () => {
                const id = consoles.currentWidget && consoles.currentWidget.id;
                if (id) {
                    return app.commands.execute(CommandIDs.select, { id });
                }
            }
        });
        // Set enter key for console completer select command.
        app.commands.addKeyBinding({
            command: CommandIDs.selectConsole,
            keys: ['Enter'],
            selector: `.jp-ConsolePanel .jp-mod-completer-active`
        });
    }
};
/**
 * An extension that registers notebooks for code completion.
 */
const notebooks = {
    id: '@jupyterlab/completer-extension:notebooks',
    requires: [completer_1.ICompletionManager, notebook_1.INotebookTracker],
    autoStart: true,
    activate: (app, manager, notebooks) => {
        // Create a handler for each notebook that is created.
        notebooks.widgetAdded.connect((sender, panel) => {
            const cell = panel.content.activeCell;
            const editor = cell && cell.editor;
            const session = panel.session;
            const parent = panel;
            const connector = new completer_1.CompletionConnector({ session, editor });
            const handler = manager.register({ connector, editor, parent });
            // Listen for active cell changes.
            panel.content.activeCellChanged.connect((sender, cell) => {
                const editor = cell && cell.editor;
                handler.editor = editor;
                handler.connector = new completer_1.CompletionConnector({ session, editor });
            });
        });
        // Add notebook completer command.
        app.commands.addCommand(CommandIDs.invokeNotebook, {
            execute: () => {
                const panel = notebooks.currentWidget;
                if (panel && panel.content.activeCell.model.type === 'code') {
                    return app.commands.execute(CommandIDs.invoke, { id: panel.id });
                }
            }
        });
        // Add notebook completer select command.
        app.commands.addCommand(CommandIDs.selectNotebook, {
            execute: () => {
                const id = notebooks.currentWidget && notebooks.currentWidget.id;
                if (id) {
                    return app.commands.execute(CommandIDs.select, { id });
                }
            }
        });
        // Set enter key for notebook completer select command.
        app.commands.addKeyBinding({
            command: CommandIDs.selectNotebook,
            keys: ['Enter'],
            selector: `.jp-Notebook .jp-mod-completer-active`
        });
    }
};
/**
 * An extension that registers file editors for completion.
 */
const files = {
    id: '@jupyterlab/completer-extension:files',
    requires: [completer_1.ICompletionManager, fileeditor_1.IEditorTracker],
    autoStart: true,
    activate: (app, manager, editorTracker) => {
        // Keep a list of active ISessions so that we can
        // clean them up when they are no longer needed.
        const activeSessions = {};
        // When a new file editor is created, make the completer for it.
        editorTracker.widgetAdded.connect((sender, widget) => {
            const sessions = app.serviceManager.sessions;
            const editor = widget.content.editor;
            const contextConnector = new completer_1.ContextConnector({ editor });
            // When the list of running sessions changes,
            // check to see if there are any kernels with a
            // matching path for this file editor.
            const onRunningChanged = (sender, models) => {
                const oldSession = activeSessions[widget.id];
                // Search for a matching path.
                const model = algorithm_1.find(models, m => m.path === widget.context.path);
                if (model) {
                    // If there is a matching path, but it is the same
                    // session as we previously had, do nothing.
                    if (oldSession && oldSession.id === model.id) {
                        return;
                    }
                    // Otherwise, dispose of the old session and reset to
                    // a new CompletionConnector.
                    if (oldSession) {
                        delete activeSessions[widget.id];
                        oldSession.dispose();
                    }
                    const session = sessions.connectTo(model);
                    handler.connector = new completer_1.CompletionConnector({ session, editor });
                    activeSessions[widget.id] = session;
                }
                else {
                    // If we didn't find a match, make sure
                    // the connector is the contextConnector and
                    // dispose of any previous connection.
                    handler.connector = contextConnector;
                    if (oldSession) {
                        delete activeSessions[widget.id];
                        oldSession.dispose();
                    }
                }
            };
            services_1.Session.listRunning().then(models => {
                onRunningChanged(sessions, models);
            });
            sessions.runningChanged.connect(onRunningChanged);
            // Initially create the handler with the contextConnector.
            // If a kernel session is found matching this file editor,
            // it will be replaced in onRunningChanged().
            const handler = manager.register({
                connector: contextConnector,
                editor,
                parent: widget
            });
            // When the widget is disposed, do some cleanup.
            widget.disposed.connect(() => {
                sessions.runningChanged.disconnect(onRunningChanged);
                const session = activeSessions[widget.id];
                if (session) {
                    delete activeSessions[widget.id];
                    session.dispose();
                }
            });
        });
        // Add console completer invoke command.
        app.commands.addCommand(CommandIDs.invokeFile, {
            execute: () => {
                const id = editorTracker.currentWidget && editorTracker.currentWidget.id;
                if (id) {
                    return app.commands.execute(CommandIDs.invoke, { id });
                }
            }
        });
        // Add console completer select command.
        app.commands.addCommand(CommandIDs.selectFile, {
            execute: () => {
                const id = editorTracker.currentWidget && editorTracker.currentWidget.id;
                if (id) {
                    return app.commands.execute(CommandIDs.select, { id });
                }
            }
        });
        // Set enter key for console completer select command.
        app.commands.addKeyBinding({
            command: CommandIDs.selectFile,
            keys: ['Enter'],
            selector: `.jp-FileEditor .jp-mod-completer-active`
        });
    }
};
/**
 * Export the plugins as default.
 */
const plugins = [manager, consoles, notebooks, files];
exports.default = plugins;
