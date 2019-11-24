"use strict";
// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const services_1 = require("@jupyterlab/services");
const algorithm_1 = require("@phosphor/algorithm");
const widgets_1 = require("@phosphor/widgets");
const coreutils_1 = require("@jupyterlab/coreutils");
const console_1 = require("@jupyterlab/console");
const fileeditor_1 = require("@jupyterlab/fileeditor");
const notebook_1 = require("@jupyterlab/notebook");
const rendermime_1 = require("@jupyterlab/rendermime");
const tooltip_1 = require("@jupyterlab/tooltip");
/**
 * The command IDs used by the tooltip plugin.
 */
var CommandIDs;
(function (CommandIDs) {
    CommandIDs.dismiss = 'tooltip:dismiss';
    CommandIDs.launchConsole = 'tooltip:launch-console';
    CommandIDs.launchNotebook = 'tooltip:launch-notebook';
    CommandIDs.launchFile = 'tooltip:launch-file';
})(CommandIDs || (CommandIDs = {}));
/**
 * The main tooltip manager plugin.
 */
const manager = {
    id: '@jupyterlab/tooltip-extension:manager',
    autoStart: true,
    provides: tooltip_1.ITooltipManager,
    activate: (app) => {
        let tooltip = null;
        // Add tooltip dismiss command.
        app.commands.addCommand(CommandIDs.dismiss, {
            execute: () => {
                if (tooltip) {
                    tooltip.dispose();
                    tooltip = null;
                }
            }
        });
        return {
            invoke(options) {
                const detail = 0;
                const { anchor, editor, kernel, rendermime } = options;
                if (tooltip) {
                    tooltip.dispose();
                    tooltip = null;
                }
                return Private.fetch({ detail, editor, kernel })
                    .then(bundle => {
                    tooltip = new tooltip_1.Tooltip({ anchor, bundle, editor, rendermime });
                    widgets_1.Widget.attach(tooltip, document.body);
                })
                    .catch(() => {
                    /* Fails silently. */
                });
            }
        };
    }
};
/**
 * The console tooltip plugin.
 */
const consoles = {
    id: '@jupyterlab/tooltip-extension:consoles',
    autoStart: true,
    requires: [tooltip_1.ITooltipManager, console_1.IConsoleTracker],
    activate: (app, manager, consoles) => {
        // Add tooltip launch command.
        app.commands.addCommand(CommandIDs.launchConsole, {
            execute: () => {
                const parent = consoles.currentWidget;
                if (!parent) {
                    return;
                }
                const anchor = parent.console;
                const editor = anchor.promptCell.editor;
                const kernel = anchor.session.kernel;
                const rendermime = anchor.rendermime;
                // If all components necessary for rendering exist, create a tooltip.
                if (!!editor && !!kernel && !!rendermime) {
                    return manager.invoke({ anchor, editor, kernel, rendermime });
                }
            }
        });
    }
};
/**
 * The notebook tooltip plugin.
 */
const notebooks = {
    id: '@jupyterlab/tooltip-extension:notebooks',
    autoStart: true,
    requires: [tooltip_1.ITooltipManager, notebook_1.INotebookTracker],
    activate: (app, manager, notebooks) => {
        // Add tooltip launch command.
        app.commands.addCommand(CommandIDs.launchNotebook, {
            execute: () => {
                const parent = notebooks.currentWidget;
                if (!parent) {
                    return;
                }
                const anchor = parent.content;
                const editor = anchor.activeCell.editor;
                const kernel = parent.session.kernel;
                const rendermime = parent.rendermime;
                // If all components necessary for rendering exist, create a tooltip.
                if (!!editor && !!kernel && !!rendermime) {
                    return manager.invoke({ anchor, editor, kernel, rendermime });
                }
            }
        });
    }
};
/**
 * The file editor tooltip plugin.
 */
const files = {
    id: '@jupyterlab/tooltip-extension:files',
    autoStart: true,
    requires: [tooltip_1.ITooltipManager, fileeditor_1.IEditorTracker, rendermime_1.IRenderMimeRegistry],
    activate: (app, manager, editorTracker, rendermime) => {
        // Keep a list of active ISessions so that we can
        // clean them up when they are no longer needed.
        const activeSessions = {};
        const sessions = app.serviceManager.sessions;
        // When the list of running sessions changes,
        // check to see if there are any kernels with a
        // matching path for the file editors.
        const onRunningChanged = (sender, models) => {
            editorTracker.forEach(file => {
                const model = algorithm_1.find(models, m => file.context.path === m.path);
                if (model) {
                    const oldSession = activeSessions[file.id];
                    // If there is a matching path, but it is the same
                    // session as we previously had, do nothing.
                    if (oldSession && oldSession.id === model.id) {
                        return;
                    }
                    // Otherwise, dispose of the old session and reset to
                    // a new CompletionConnector.
                    if (oldSession) {
                        delete activeSessions[file.id];
                        oldSession.dispose();
                    }
                    const session = sessions.connectTo(model);
                    activeSessions[file.id] = session;
                }
                else {
                    const session = activeSessions[file.id];
                    if (session) {
                        session.dispose();
                        delete activeSessions[file.id];
                    }
                }
            });
        };
        services_1.Session.listRunning().then(models => {
            onRunningChanged(sessions, models);
        });
        sessions.runningChanged.connect(onRunningChanged);
        // Clean up after a widget when it is disposed
        editorTracker.widgetAdded.connect((sender, widget) => {
            widget.disposed.connect(w => {
                const session = activeSessions[w.id];
                if (session) {
                    session.dispose();
                    delete activeSessions[w.id];
                }
            });
        });
        // Add tooltip launch command.
        app.commands.addCommand(CommandIDs.launchFile, {
            execute: () => __awaiter(this, void 0, void 0, function* () {
                const parent = editorTracker.currentWidget;
                const kernel = parent &&
                    activeSessions[parent.id] &&
                    activeSessions[parent.id].kernel;
                if (!kernel) {
                    return;
                }
                const anchor = parent.content;
                const editor = anchor.editor;
                // If all components necessary for rendering exist, create a tooltip.
                if (!!editor && !!kernel && !!rendermime) {
                    return manager.invoke({ anchor, editor, kernel, rendermime });
                }
            })
        });
    }
};
/**
 * Export the plugins as default.
 */
const plugins = [manager, consoles, notebooks, files];
exports.default = plugins;
/**
 * A namespace for private data.
 */
var Private;
(function (Private) {
    /**
     * A counter for outstanding requests.
     */
    let pending = 0;
    /**
     * Fetch a tooltip's content from the API server.
     */
    function fetch(options) {
        let { detail, editor, kernel } = options;
        let code = editor.model.value.text;
        let position = editor.getCursorPosition();
        let offset = coreutils_1.Text.jsIndexToCharIndex(editor.getOffsetAt(position), code);
        // Clear hints if the new text value is empty or kernel is unavailable.
        if (!code || !kernel) {
            return Promise.reject(void 0);
        }
        let contents = {
            code,
            cursor_pos: offset,
            detail_level: detail || 0
        };
        let current = ++pending;
        return kernel.requestInspect(contents).then(msg => {
            let value = msg.content;
            // If a newer request is pending, bail.
            if (current !== pending) {
                return Promise.reject(void 0);
            }
            // If request fails or returns negative results, bail.
            if (value.status !== 'ok' || !value.found) {
                return Promise.reject(void 0);
            }
            return Promise.resolve(value.data);
        });
    }
    Private.fetch = fetch;
})(Private || (Private = {}));
