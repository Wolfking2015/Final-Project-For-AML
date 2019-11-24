"use strict";
// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
Object.defineProperty(exports, "__esModule", { value: true });
const algorithm_1 = require("@phosphor/algorithm");
const widgets_1 = require("@phosphor/widgets");
const apputils_1 = require("@jupyterlab/apputils");
const coreutils_1 = require("@jupyterlab/coreutils");
const docmanager_1 = require("@jupyterlab/docmanager");
const mainmenu_1 = require("@jupyterlab/mainmenu");
/**
 * The name of the factory that creates markdown widgets.
 */
const MARKDOWN_FACTORY = 'Markdown Preview';
/**
 * The command IDs used by the document manager plugin.
 */
var CommandIDs;
(function (CommandIDs) {
    CommandIDs.clone = 'docmanager:clone';
    CommandIDs.close = 'docmanager:close';
    CommandIDs.closeAllFiles = 'docmanager:close-all-files';
    CommandIDs.closeOtherTabs = 'docmanager:close-other-tabs';
    CommandIDs.closeRightTabs = 'docmanager:close-right-tabs';
    CommandIDs.deleteFile = 'docmanager:delete-file';
    CommandIDs.newUntitled = 'docmanager:new-untitled';
    CommandIDs.open = 'docmanager:open';
    CommandIDs.openBrowserTab = 'docmanager:open-browser-tab';
    CommandIDs.openDirect = 'docmanager:open-direct';
    CommandIDs.reload = 'docmanager:reload';
    CommandIDs.rename = 'docmanager:rename';
    CommandIDs.restoreCheckpoint = 'docmanager:restore-checkpoint';
    CommandIDs.save = 'docmanager:save';
    CommandIDs.saveAll = 'docmanager:save-all';
    CommandIDs.saveAs = 'docmanager:save-as';
    CommandIDs.toggleAutosave = 'docmanager:toggle-autosave';
    CommandIDs.showInFileBrowser = 'docmanager:show-in-file-browser';
    CommandIDs.markdownPreview = 'markdownviewer:open';
})(CommandIDs || (CommandIDs = {}));
const pluginId = '@jupyterlab/docmanager-extension:plugin';
/**
 * The default document manager provider.
 */
const plugin = {
    id: pluginId,
    provides: docmanager_1.IDocumentManager,
    requires: [apputils_1.ICommandPalette, mainmenu_1.IMainMenu, coreutils_1.ISettingRegistry],
    activate: (app, palette, menu, settingRegistry) => {
        const manager = app.serviceManager;
        const contexts = new WeakSet();
        const opener = {
            open: (widget, options) => {
                const shell = app.shell;
                if (!widget.id) {
                    widget.id = `document-manager-${++Private.id}`;
                }
                widget.title.dataset = Object.assign({ type: 'document-title' }, widget.title.dataset);
                if (!widget.isAttached) {
                    app.shell.addToMainArea(widget, options || {});
                }
                shell.activateById(widget.id);
                // Handle dirty state for open documents.
                let context = docManager.contextForWidget(widget);
                if (!contexts.has(context)) {
                    handleContext(app, context);
                    contexts.add(context);
                }
            }
        };
        const registry = app.docRegistry;
        const when = app.restored.then(() => void 0);
        const docManager = new docmanager_1.DocumentManager({
            registry,
            manager,
            opener,
            when,
            setBusy: app.setBusy.bind(app)
        });
        // Register the file operations commands.
        addCommands(app, docManager, palette, opener, settingRegistry);
        // Keep up to date with the settings registry.
        const onSettingsUpdated = (settings) => {
            const autosave = settings.get('autosave').composite;
            docManager.autosave =
                autosave === true || autosave === false ? autosave : true;
            app.commands.notifyCommandChanged(CommandIDs.toggleAutosave);
        };
        // Fetch the initial state of the settings.
        Promise.all([settingRegistry.load(pluginId), app.restored])
            .then(([settings]) => {
            settings.changed.connect(onSettingsUpdated);
            onSettingsUpdated(settings);
        })
            .catch((reason) => {
            console.error(reason.message);
        });
        menu.settingsMenu.addGroup([{ command: CommandIDs.toggleAutosave }], 5);
        return docManager;
    }
};
/**
 * Export the plugin as default.
 */
exports.default = plugin;
/* Widget to display the revert to checkpoint confirmation. */
class RevertConfirmWidget extends widgets_1.Widget {
    /**
     * Construct a new revert confirmation widget.
     */
    constructor(checkpoint) {
        super({ node: Private.createRevertConfirmNode(checkpoint) });
    }
}
/**
 * Add the file operations commands to the application's command registry.
 */
function addCommands(app, docManager, palette, opener, settingRegistry) {
    const { commands, docRegistry, shell } = app;
    const category = 'File Operations';
    const isEnabled = () => {
        const { currentWidget } = shell;
        return !!(currentWidget && docManager.contextForWidget(currentWidget));
    };
    const isWritable = () => {
        const { currentWidget } = shell;
        if (!currentWidget) {
            return false;
        }
        const context = docManager.contextForWidget(currentWidget);
        return !!(context &&
            context.contentsModel &&
            context.contentsModel.writable);
    };
    // fetches the doc widget associated with the most recent contextmenu event
    const contextMenuWidget = () => {
        const pathRe = /[Pp]ath:\s?(.*)\n?/;
        const test = (node) => node['title'] && !!node['title'].match(pathRe);
        const node = app.contextMenuFirst(test);
        if (!node) {
            // fall back to active doc widget if path cannot be obtained from event
            return app.shell.currentWidget;
        }
        const pathMatch = node['title'].match(pathRe);
        return docManager.findWidget(pathMatch[1]);
    };
    // operates on active widget by default
    const fileType = (widget = shell.currentWidget) => {
        if (!widget) {
            return 'File';
        }
        const context = docManager.contextForWidget(widget);
        if (!context) {
            return '';
        }
        const fts = docRegistry.getFileTypesForPath(context.path);
        return fts.length && fts[0].displayName ? fts[0].displayName : 'File';
    };
    const closeWidgets = (widgets) => {
        widgets.forEach(widget => widget.close());
    };
    const findTab = (area, widget) => {
        switch (area.type) {
            case 'split-area':
                const iterator = algorithm_1.iter(area.children);
                let tab = null;
                let value = null;
                do {
                    value = iterator.next();
                    if (value) {
                        tab = findTab(value, widget);
                    }
                } while (!tab && value);
                return tab;
            case 'tab-area':
                const { id } = widget;
                return area.widgets.some(widget => widget.id === id) ? area : null;
            default:
                return null;
        }
    };
    const tabAreaFor = (widget) => {
        const { mainArea } = shell.saveLayout();
        if (mainArea.mode !== 'multiple-document') {
            return null;
        }
        let area = mainArea.dock.main;
        if (!area) {
            return null;
        }
        return findTab(area, widget);
    };
    const widgetsRightOf = (widget) => {
        const { id } = widget;
        const tabArea = tabAreaFor(widget);
        const widgets = tabArea ? tabArea.widgets || [] : [];
        const index = widgets.findIndex(widget => widget.id === id);
        if (index < 0) {
            return [];
        }
        return widgets.slice(index + 1);
    };
    commands.addCommand(CommandIDs.close, {
        label: () => {
            const widget = shell.currentWidget;
            let name = 'File';
            if (widget) {
                const typeName = fileType();
                name = typeName || widget.title.label;
            }
            return `Close ${name}`;
        },
        isEnabled: () => !!shell.currentWidget && !!shell.currentWidget.title.closable,
        execute: () => {
            if (shell.currentWidget) {
                shell.currentWidget.close();
            }
        }
    });
    commands.addCommand(CommandIDs.closeAllFiles, {
        label: 'Close All',
        execute: () => {
            shell.closeAll();
        }
    });
    commands.addCommand(CommandIDs.closeOtherTabs, {
        label: () => `Close Other Tabs`,
        isEnabled: () => {
            // Ensure there are at least two widgets.
            const iterator = shell.widgets('main');
            return !!iterator.next() && !!iterator.next();
        },
        execute: () => {
            const widget = contextMenuWidget();
            if (!widget) {
                return;
            }
            const { id } = widget;
            const otherWidgets = algorithm_1.toArray(shell.widgets('main')).filter(widget => widget.id !== id);
            closeWidgets(otherWidgets);
        }
    });
    commands.addCommand(CommandIDs.closeRightTabs, {
        label: () => `Close Tabs to Right`,
        isEnabled: () => contextMenuWidget() && widgetsRightOf(contextMenuWidget()).length > 0,
        execute: () => {
            const widget = contextMenuWidget();
            if (!widget) {
                return;
            }
            closeWidgets(widgetsRightOf(widget));
        }
    });
    commands.addCommand(CommandIDs.deleteFile, {
        label: () => `Delete ${fileType()}`,
        execute: args => {
            const path = typeof args['path'] === 'undefined' ? '' : args['path'];
            if (!path) {
                const command = CommandIDs.deleteFile;
                throw new Error(`A non-empty path is required for ${command}.`);
            }
            return docManager.deleteFile(path);
        }
    });
    commands.addCommand(CommandIDs.newUntitled, {
        execute: args => {
            const errorTitle = args['error'] || 'Error';
            const path = typeof args['path'] === 'undefined' ? '' : args['path'];
            let options = {
                type: args['type'],
                path
            };
            if (args['type'] === 'file') {
                options.ext = args['ext'] || '.txt';
            }
            return docManager.services.contents
                .newUntitled(options)
                .catch(error => apputils_1.showErrorMessage(errorTitle, error));
        },
        label: args => args['label'] || `New ${args['type']}`
    });
    commands.addCommand(CommandIDs.open, {
        execute: args => {
            const path = typeof args['path'] === 'undefined' ? '' : args['path'];
            const factory = args['factory'] || void 0;
            const kernel = args['kernel'] || void 0;
            const options = args['options'] || void 0;
            return docManager.services.contents
                .get(path, { content: false })
                .then(() => docManager.openOrReveal(path, factory, kernel, options));
        },
        icon: args => args['icon'] || '',
        label: args => (args['label'] || args['factory']),
        mnemonic: args => args['mnemonic'] || -1
    });
    commands.addCommand(CommandIDs.openBrowserTab, {
        execute: args => {
            const path = typeof args['path'] === 'undefined' ? '' : args['path'];
            if (!path) {
                return;
            }
            return docManager.services.contents.getDownloadUrl(path).then(url => {
                window.open(url, '_blank');
            });
        },
        icon: args => args['icon'] || '',
        label: () => 'Open in New Browser Tab'
    });
    commands.addCommand(CommandIDs.openDirect, {
        label: () => 'Open From Path...',
        caption: 'Open from path',
        isEnabled: () => true,
        execute: () => {
            return docmanager_1.getOpenPath(docManager.services.contents).then(path => {
                if (!path) {
                    return;
                }
                docManager.services.contents.get(path, { content: false }).then(args => {
                    // exists
                    return commands.execute(CommandIDs.open, { path: path });
                }, () => {
                    // does not exist
                    return apputils_1.showDialog({
                        title: 'Cannot open',
                        body: 'File not found',
                        buttons: [apputils_1.Dialog.okButton()]
                    });
                });
                return;
            });
        }
    });
    commands.addCommand(CommandIDs.reload, {
        label: () => `Reload ${fileType()} from Disk`,
        caption: 'Reload contents from disk',
        isEnabled,
        execute: () => {
            if (!isEnabled()) {
                return;
            }
            const context = docManager.contextForWidget(shell.currentWidget);
            return apputils_1.showDialog({
                title: 'Reload Notebook from Disk',
                body: `Are you sure you want to reload
          the notebook from the disk?`,
                buttons: [apputils_1.Dialog.cancelButton(), apputils_1.Dialog.warnButton({ label: 'Reload' })]
            }).then(result => {
                if (result.button.accept && !context.isDisposed) {
                    return context.revert();
                }
            });
        }
    });
    commands.addCommand(CommandIDs.restoreCheckpoint, {
        label: () => `Revert ${fileType()} to Checkpoint`,
        caption: 'Revert contents to previous checkpoint',
        isEnabled,
        execute: () => {
            if (!isEnabled()) {
                return;
            }
            const context = docManager.contextForWidget(shell.currentWidget);
            return context.listCheckpoints().then(checkpoints => {
                if (checkpoints.length < 1) {
                    return;
                }
                const lastCheckpoint = checkpoints[checkpoints.length - 1];
                if (!lastCheckpoint) {
                    return;
                }
                return apputils_1.showDialog({
                    title: 'Revert notebook to checkpoint',
                    body: new RevertConfirmWidget(lastCheckpoint),
                    buttons: [
                        apputils_1.Dialog.cancelButton(),
                        apputils_1.Dialog.warnButton({ label: 'Revert' })
                    ]
                }).then(result => {
                    if (context.isDisposed) {
                        return;
                    }
                    if (result.button.accept) {
                        if (context.model.readOnly) {
                            return context.revert();
                        }
                        return context.restoreCheckpoint().then(() => context.revert());
                    }
                });
            });
        }
    });
    commands.addCommand(CommandIDs.save, {
        label: () => `Save ${fileType()}`,
        caption: 'Save and create checkpoint',
        isEnabled: isWritable,
        execute: () => {
            if (isEnabled()) {
                let context = docManager.contextForWidget(shell.currentWidget);
                if (context.model.readOnly) {
                    return apputils_1.showDialog({
                        title: 'Cannot Save',
                        body: 'Document is read-only',
                        buttons: [apputils_1.Dialog.okButton()]
                    });
                }
                return context
                    .save()
                    .then(() => context.createCheckpoint())
                    .catch(err => {
                    // If the save was canceled by user-action, do nothing.
                    if (err.message === 'Cancel') {
                        return;
                    }
                    throw err;
                });
            }
        }
    });
    commands.addCommand(CommandIDs.saveAll, {
        label: () => 'Save All',
        caption: 'Save all open documents',
        isEnabled: () => {
            const iterator = shell.widgets('main');
            let widget = iterator.next();
            while (widget) {
                let context = docManager.contextForWidget(widget);
                if (context &&
                    context.contentsModel &&
                    context.contentsModel.writable) {
                    return true;
                }
                widget = iterator.next();
            }
            // disable saveAll if all of the widgets models
            // have writable === false
            return false;
        },
        execute: () => {
            const iterator = shell.widgets('main');
            const promises = [];
            const paths = new Set(); // Cache so we don't double save files.
            let widget = iterator.next();
            while (widget) {
                const context = docManager.contextForWidget(widget);
                if (context && !context.model.readOnly && !paths.has(context.path)) {
                    paths.add(context.path);
                    promises.push(context.save());
                }
                widget = iterator.next();
            }
            return Promise.all(promises);
        }
    });
    commands.addCommand(CommandIDs.saveAs, {
        label: () => `Save ${fileType()} As…`,
        caption: 'Save with new path',
        isEnabled,
        execute: () => {
            if (isEnabled()) {
                let context = docManager.contextForWidget(shell.currentWidget);
                return context.saveAs();
            }
        }
    });
    commands.addCommand(CommandIDs.rename, {
        label: () => `Rename ${fileType(contextMenuWidget())}…`,
        isEnabled,
        execute: () => {
            if (isEnabled()) {
                let context = docManager.contextForWidget(contextMenuWidget());
                return docmanager_1.renameDialog(docManager, context.path);
            }
        }
    });
    commands.addCommand(CommandIDs.clone, {
        label: () => `New View for ${fileType(contextMenuWidget())}`,
        isEnabled,
        execute: args => {
            const widget = contextMenuWidget();
            const options = args['options'] || {
                mode: 'split-right'
            };
            if (!widget) {
                return;
            }
            // Clone the widget.
            let child = docManager.cloneWidget(widget);
            if (child) {
                opener.open(child, options);
            }
        }
    });
    commands.addCommand(CommandIDs.toggleAutosave, {
        label: 'Autosave Documents',
        isToggled: () => docManager.autosave,
        execute: () => {
            const value = !docManager.autosave;
            const key = 'autosave';
            return settingRegistry
                .set(pluginId, key, value)
                .catch((reason) => {
                console.error(`Failed to set ${pluginId}:${key} - ${reason.message}`);
            });
        }
    });
    commands.addCommand(CommandIDs.showInFileBrowser, {
        label: () => `Show in File Browser`,
        isEnabled,
        execute: () => {
            let context = docManager.contextForWidget(contextMenuWidget());
            if (!context) {
                return;
            }
            // 'activate' is needed if this command is selected in the "open tabs" sidebar
            commands.execute('filebrowser:activate', { path: context.path });
            commands.execute('filebrowser:navigate', { path: context.path });
        }
    });
    commands.addCommand(CommandIDs.markdownPreview, {
        label: 'Markdown Preview',
        execute: args => {
            let path = args['path'];
            if (typeof path !== 'string') {
                return;
            }
            return commands.execute('docmanager:open', {
                path,
                factory: MARKDOWN_FACTORY,
                options: args['options']
            });
        }
    });
    app.contextMenu.addItem({
        command: CommandIDs.rename,
        selector: '[data-type="document-title"]',
        rank: 1
    });
    app.contextMenu.addItem({
        command: CommandIDs.clone,
        selector: '[data-type="document-title"]',
        rank: 2
    });
    app.contextMenu.addItem({
        command: CommandIDs.showInFileBrowser,
        selector: '[data-type="document-title"]',
        rank: 3
    });
    app.contextMenu.addItem({
        command: CommandIDs.closeOtherTabs,
        selector: '[data-type="document-title"]',
        rank: 4
    });
    app.contextMenu.addItem({
        command: CommandIDs.closeRightTabs,
        selector: '[data-type="document-title"]',
        rank: 5
    });
    [
        CommandIDs.openDirect,
        CommandIDs.save,
        CommandIDs.reload,
        CommandIDs.restoreCheckpoint,
        CommandIDs.saveAs,
        CommandIDs.clone,
        CommandIDs.close,
        CommandIDs.closeAllFiles,
        CommandIDs.closeOtherTabs,
        CommandIDs.closeRightTabs,
        CommandIDs.toggleAutosave
    ].forEach(command => {
        palette.addItem({ command, category });
    });
}
/**
 * Handle dirty state for a context.
 */
function handleContext(app, context) {
    let disposable = null;
    let onStateChanged = (sender, args) => {
        if (args.name === 'dirty') {
            if (args.newValue === true) {
                if (!disposable) {
                    disposable = app.setDirty();
                }
            }
            else if (disposable) {
                disposable.dispose();
                disposable = null;
            }
        }
    };
    context.ready.then(() => {
        context.model.stateChanged.connect(onStateChanged);
        if (context.model.dirty) {
            disposable = app.setDirty();
        }
    });
    context.disposed.connect(() => {
        if (disposable) {
            disposable.dispose();
        }
    });
}
/**
 * A namespace for private module data.
 */
var Private;
(function (Private) {
    /**
     * A counter for unique IDs.
     */
    Private.id = 0;
    function createRevertConfirmNode(checkpoint) {
        let body = document.createElement('div');
        let confirmMessage = document.createElement('p');
        let confirmText = document.createTextNode(`Are you sure you want to revert
      the notebook to the latest checkpoint? `);
        let cannotUndoText = document.createElement('strong');
        cannotUndoText.textContent = 'This cannot be undone.';
        confirmMessage.appendChild(confirmText);
        confirmMessage.appendChild(cannotUndoText);
        let lastCheckpointMessage = document.createElement('p');
        let lastCheckpointText = document.createTextNode('The checkpoint was last updated at: ');
        let lastCheckpointDate = document.createElement('p');
        let date = new Date(checkpoint.last_modified);
        lastCheckpointDate.style.textAlign = 'center';
        lastCheckpointDate.textContent =
            coreutils_1.Time.format(date, 'dddd, MMMM Do YYYY, h:mm:ss a') +
                ' (' +
                coreutils_1.Time.formatHuman(date) +
                ')';
        lastCheckpointMessage.appendChild(lastCheckpointText);
        lastCheckpointMessage.appendChild(lastCheckpointDate);
        body.appendChild(confirmMessage);
        body.appendChild(lastCheckpointMessage);
        return body;
    }
    Private.createRevertConfirmNode = createRevertConfirmNode;
})(Private || (Private = {}));
