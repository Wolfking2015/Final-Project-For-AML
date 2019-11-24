"use strict";
// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
Object.defineProperty(exports, "__esModule", { value: true });
const application_1 = require("@jupyterlab/application");
const apputils_1 = require("@jupyterlab/apputils");
const coreutils_1 = require("@jupyterlab/coreutils");
const docmanager_1 = require("@jupyterlab/docmanager");
const filebrowser_1 = require("@jupyterlab/filebrowser");
const algorithm_1 = require("@phosphor/algorithm");
const widgets_1 = require("@phosphor/widgets");
/**
 * The command IDs used by the file browser plugin.
 */
var CommandIDs;
(function (CommandIDs) {
    CommandIDs.copy = 'filebrowser:copy';
    CommandIDs.copyDownloadLink = 'filebrowser:copy-download-link';
    // For main browser only.
    CommandIDs.createLauncher = 'filebrowser:create-main-launcher';
    CommandIDs.cut = 'filebrowser:cut';
    CommandIDs.del = 'filebrowser:delete';
    CommandIDs.download = 'filebrowser:download';
    CommandIDs.duplicate = 'filebrowser:duplicate';
    // For main browser only.
    CommandIDs.hideBrowser = 'filebrowser:hide-main';
    CommandIDs.navigate = 'filebrowser:navigate';
    CommandIDs.open = 'filebrowser:open';
    CommandIDs.openBrowserTab = 'filebrowser:open-browser-tab';
    CommandIDs.paste = 'filebrowser:paste';
    CommandIDs.rename = 'filebrowser:rename';
    // For main browser only.
    CommandIDs.share = 'filebrowser:share-main';
    // For main browser only.
    CommandIDs.copyPath = 'filebrowser:copy-path';
    CommandIDs.showBrowser = 'filebrowser:activate';
    CommandIDs.shutdown = 'filebrowser:shutdown';
    // For main browser only.
    CommandIDs.toggleBrowser = 'filebrowser:toggle-main';
})(CommandIDs || (CommandIDs = {}));
/**
 * The default file browser extension.
 */
const browser = {
    activate: activateBrowser,
    id: '@jupyterlab/filebrowser-extension:browser',
    requires: [filebrowser_1.IFileBrowserFactory, application_1.ILayoutRestorer],
    autoStart: true
};
/**
 * The default file browser factory provider.
 */
const factory = {
    activate: activateFactory,
    id: '@jupyterlab/filebrowser-extension:factory',
    provides: filebrowser_1.IFileBrowserFactory,
    requires: [docmanager_1.IDocumentManager, coreutils_1.IStateDB]
};
/**
 * The file browser namespace token.
 */
const namespace = 'filebrowser';
/**
 * Export the plugins as default.
 */
const plugins = [factory, browser];
exports.default = plugins;
/**
 * Activate the file browser factory provider.
 */
function activateFactory(app, docManager, state) {
    const { commands } = app;
    const tracker = new apputils_1.InstanceTracker({ namespace });
    const createFileBrowser = (id, options = {}) => {
        const model = new filebrowser_1.FileBrowserModel({
            manager: docManager,
            driveName: options.driveName || '',
            refreshInterval: options.refreshInterval,
            state: options.state === null ? null : options.state || state
        });
        const widget = new filebrowser_1.FileBrowser({
            id,
            model,
            commands: options.commands || commands
        });
        // Add a launcher toolbar item.
        let launcher = new apputils_1.ToolbarButton({
            iconClassName: 'jp-AddIcon jp-Icon jp-Icon-16',
            onClick: () => {
                return createLauncher(commands, widget);
            },
            tooltip: 'New Launcher'
        });
        widget.toolbar.insertItem(0, 'launch', launcher);
        // Track the newly created file browser.
        tracker.add(widget);
        return widget;
    };
    const defaultBrowser = createFileBrowser('filebrowser');
    return { createFileBrowser, defaultBrowser, tracker };
}
/**
 * Activate the default file browser in the sidebar.
 */
function activateBrowser(app, factory, restorer) {
    const browser = factory.defaultBrowser;
    const { commands, shell } = app;
    // Let the application restorer track the primary file browser (that is
    // automatically created) for restoration of application state (e.g. setting
    // the file browser as the current side bar widget).
    //
    // All other file browsers created by using the factory function are
    // responsible for their own restoration behavior, if any.
    restorer.add(browser, namespace);
    addCommands(app, factory.tracker, browser);
    browser.title.iconClass = 'jp-FolderIcon jp-SideBar-tabIcon';
    browser.title.caption = 'File Browser';
    shell.addToLeftArea(browser, { rank: 100 });
    // If the layout is a fresh session without saved data, open file browser.
    app.restored.then(layout => {
        if (layout.fresh) {
            commands.execute(CommandIDs.showBrowser, void 0);
        }
    });
    Promise.all([app.restored, browser.model.restored]).then(() => {
        function maybeCreate() {
            // Create a launcher if there are no open items.
            if (app.shell.isEmpty('main')) {
                createLauncher(commands, browser);
            }
        }
        // When layout is modified, create a launcher if there are no open items.
        shell.layoutModified.connect(() => {
            maybeCreate();
        });
        maybeCreate();
    });
}
/**
 * Add the main file browser commands to the application's command registry.
 */
function addCommands(app, tracker, browser) {
    const registry = app.docRegistry;
    const getBrowserForPath = (path) => {
        const driveName = app.serviceManager.contents.driveName(path);
        if (driveName) {
            let browserForPath = tracker.find(fb => fb.model.driveName === driveName);
            if (!browserForPath) {
                // warn that no filebrowser could be found for this driveName
                console.warn(`${CommandIDs.navigate} failed to find filebrowser for path: ${path}`);
                return;
            }
            return browserForPath;
        }
        // if driveName is empty, assume the main filebrowser
        return browser;
    };
    const { commands } = app;
    commands.addCommand(CommandIDs.del, {
        execute: () => {
            const widget = tracker.currentWidget;
            if (widget) {
                return widget.delete();
            }
        },
        iconClass: 'jp-MaterialIcon jp-CloseIcon',
        label: 'Delete',
        mnemonic: 0
    });
    commands.addCommand(CommandIDs.copy, {
        execute: () => {
            const widget = tracker.currentWidget;
            if (widget) {
                return widget.copy();
            }
        },
        iconClass: 'jp-MaterialIcon jp-CopyIcon',
        label: 'Copy',
        mnemonic: 0
    });
    commands.addCommand(CommandIDs.cut, {
        execute: () => {
            const widget = tracker.currentWidget;
            if (widget) {
                return widget.cut();
            }
        },
        iconClass: 'jp-MaterialIcon jp-CutIcon',
        label: 'Cut'
    });
    commands.addCommand(CommandIDs.download, {
        execute: () => {
            const widget = tracker.currentWidget;
            if (widget) {
                return widget.download();
            }
        },
        iconClass: 'jp-MaterialIcon jp-DownloadIcon',
        label: 'Download'
    });
    commands.addCommand(CommandIDs.duplicate, {
        execute: () => {
            const widget = tracker.currentWidget;
            if (widget) {
                return widget.duplicate();
            }
        },
        iconClass: 'jp-MaterialIcon jp-CopyIcon',
        label: 'Duplicate'
    });
    commands.addCommand(CommandIDs.hideBrowser, {
        execute: () => {
            const widget = tracker.currentWidget;
            if (widget && !widget.isHidden) {
                app.shell.collapseLeft();
            }
        }
    });
    commands.addCommand(CommandIDs.navigate, {
        execute: args => {
            const path = args.path || '';
            const browserForPath = getBrowserForPath(path);
            const services = app.serviceManager;
            const localPath = services.contents.localPath(path);
            const failure = (reason) => {
                console.warn(`${CommandIDs.navigate} failed to open: ${path}`, reason);
            };
            return services.ready
                .then(() => services.contents.get(path))
                .then(value => {
                const { model } = browserForPath;
                const { restored } = model;
                if (value.type === 'directory') {
                    return restored.then(() => model.cd(`/${localPath}`));
                }
                return restored
                    .then(() => model.cd(`/${coreutils_1.PathExt.dirname(localPath)}`))
                    .then(() => commands.execute('docmanager:open', { path: path }));
            })
                .catch(failure);
        }
    });
    commands.addCommand(CommandIDs.open, {
        execute: args => {
            const factory = args['factory'] || void 0;
            const widget = tracker.currentWidget;
            if (!widget) {
                return;
            }
            return Promise.all(algorithm_1.toArray(algorithm_1.map(widget.selectedItems(), item => {
                if (item.type === 'directory') {
                    return widget.model.cd(item.name);
                }
                return commands.execute('docmanager:open', {
                    factory: factory,
                    path: item.path
                });
            })));
        },
        iconClass: args => {
            const factory = args['factory'] || void 0;
            if (factory) {
                // if an explicit factory is passed...
                const ft = registry.getFileType(factory);
                if (ft) {
                    // ...set an icon if the factory name corresponds to a file type name...
                    return ft.iconClass;
                }
                else {
                    // ...or leave the icon blank
                    return '';
                }
            }
            else {
                return 'jp-MaterialIcon jp-OpenFolderIcon';
            }
        },
        label: args => (args['label'] || args['factory'] || 'Open'),
        mnemonic: 0
    });
    commands.addCommand(CommandIDs.openBrowserTab, {
        execute: () => {
            const widget = tracker.currentWidget;
            if (!widget) {
                return;
            }
            return Promise.all(algorithm_1.toArray(algorithm_1.map(widget.selectedItems(), item => {
                return commands.execute('docmanager:open-browser-tab', {
                    path: item.path
                });
            })));
        },
        iconClass: 'jp-MaterialIcon jp-AddIcon',
        label: 'Open in New Browser Tab',
        mnemonic: 0
    });
    commands.addCommand(CommandIDs.copyDownloadLink, {
        execute: () => {
            const widget = tracker.currentWidget;
            if (!widget) {
                return;
            }
            return widget.model.manager.services.contents
                .getDownloadUrl(widget.selectedItems().next().path)
                .then(url => {
                apputils_1.Clipboard.copyToSystem(url);
            });
        },
        iconClass: 'jp-MaterialIcon jp-CopyIcon',
        label: 'Copy Download Link',
        mnemonic: 0
    });
    commands.addCommand(CommandIDs.paste, {
        execute: () => {
            const widget = tracker.currentWidget;
            if (widget) {
                return widget.paste();
            }
        },
        iconClass: 'jp-MaterialIcon jp-PasteIcon',
        label: 'Paste',
        mnemonic: 0
    });
    commands.addCommand(CommandIDs.rename, {
        execute: args => {
            const widget = tracker.currentWidget;
            if (widget) {
                return widget.rename();
            }
        },
        iconClass: 'jp-MaterialIcon jp-EditIcon',
        label: 'Rename',
        mnemonic: 0
    });
    commands.addCommand(CommandIDs.share, {
        execute: () => {
            const widget = tracker.currentWidget;
            if (!widget) {
                return;
            }
            const path = encodeURI(widget.selectedItems().next().path);
            const tree = coreutils_1.PageConfig.getTreeUrl({ workspace: true });
            apputils_1.Clipboard.copyToSystem(coreutils_1.URLExt.join(tree, path));
        },
        isVisible: () => tracker.currentWidget &&
            algorithm_1.toArray(tracker.currentWidget.selectedItems()).length === 1,
        iconClass: 'jp-MaterialIcon jp-LinkIcon',
        label: 'Copy Shareable Link'
    });
    commands.addCommand(CommandIDs.copyPath, {
        execute: () => {
            const widget = tracker.currentWidget;
            if (!widget) {
                return;
            }
            const item = widget.selectedItems().next();
            if (!item) {
                return;
            }
            apputils_1.Clipboard.copyToSystem(item.path);
        },
        isVisible: () => tracker.currentWidget &&
            tracker.currentWidget.selectedItems().next !== undefined,
        iconClass: 'jp-MaterialIcon jp-FileIcon',
        label: 'Copy Path'
    });
    commands.addCommand(CommandIDs.showBrowser, {
        execute: args => {
            const path = args.path || '';
            const browserForPath = getBrowserForPath(path);
            // Check for browser not found
            if (!browserForPath) {
                return;
            }
            // Shortcut if we are using the main file browser
            if (browser === browserForPath) {
                app.shell.activateById(browser.id);
                return;
            }
            else {
                const areas = ['left', 'right'];
                for (let area of areas) {
                    const it = app.shell.widgets(area);
                    let widget = it.next();
                    while (widget) {
                        if (widget.contains(browserForPath)) {
                            app.shell.activateById(widget.id);
                            return;
                        }
                        widget = it.next();
                    }
                }
            }
        }
    });
    commands.addCommand(CommandIDs.shutdown, {
        execute: () => {
            const widget = tracker.currentWidget;
            if (widget) {
                return widget.shutdownKernels();
            }
        },
        iconClass: 'jp-MaterialIcon jp-StopIcon',
        label: 'Shutdown Kernel'
    });
    commands.addCommand(CommandIDs.toggleBrowser, {
        execute: () => {
            if (browser.isHidden) {
                return commands.execute(CommandIDs.showBrowser, void 0);
            }
            return commands.execute(CommandIDs.hideBrowser, void 0);
        }
    });
    commands.addCommand(CommandIDs.createLauncher, {
        label: 'New Launcher',
        execute: () => createLauncher(commands, browser)
    });
    /**
     * A menu widget that dynamically populates with different widget factories
     * based on current filebrowser selection.
     */
    class OpenWithMenu extends widgets_1.Menu {
        onBeforeAttach(msg) {
            // clear the current menu items
            this.clearItems();
            // get the widget factories that could be used to open all of the items
            // in the current filebrowser selection
            let factories = OpenWithMenu._intersection(algorithm_1.map(tracker.currentWidget.selectedItems(), i => {
                return OpenWithMenu._getFactories(i);
            }));
            if (factories) {
                // make new menu items from the widget factories
                factories.forEach(factory => {
                    this.addItem({
                        args: { factory: factory },
                        command: CommandIDs.open
                    });
                });
            }
            super.onBeforeAttach(msg);
        }
        static _getFactories(item) {
            let factories = registry
                .preferredWidgetFactories(item.path)
                .map(f => f.name);
            const notebookFactory = registry.getWidgetFactory('notebook').name;
            if (item.type === 'notebook' &&
                factories.indexOf(notebookFactory) === -1) {
                factories.unshift(notebookFactory);
            }
            return factories;
        }
        static _intersection(iter) {
            // pop the first element of iter
            let first = iter.next();
            // first will be undefined if iter is empty
            if (!first) {
                return;
            }
            // "initialize" the intersection from first
            let isect = new Set(first);
            // reduce over the remaining elements of iter
            return algorithm_1.reduce(iter, (isect, subarr) => {
                // filter out all elements not present in both isect and subarr,
                // accumulate result in new set
                return new Set(subarr.filter(x => isect.has(x)));
            }, isect);
        }
    }
    // matches anywhere on filebrowser
    const selectorContent = '.jp-DirListing-content';
    // matches all filebrowser items
    const selectorItem = '.jp-DirListing-item[data-isdir]';
    // matches only non-directory items
    const selectorNotDir = '.jp-DirListing-item[data-isdir="false"]';
    // If the user did not click on any file, we still want to show paste,
    // so target the content rather than an item.
    app.contextMenu.addItem({
        command: CommandIDs.paste,
        selector: selectorContent,
        rank: 1
    });
    app.contextMenu.addItem({
        command: CommandIDs.open,
        selector: selectorItem,
        rank: 1
    });
    const openWith = new OpenWithMenu({ commands });
    openWith.title.label = 'Open With';
    app.contextMenu.addItem({
        type: 'submenu',
        submenu: openWith,
        selector: selectorNotDir,
        rank: 2
    });
    app.contextMenu.addItem({
        command: CommandIDs.openBrowserTab,
        selector: selectorNotDir,
        rank: 3
    });
    app.contextMenu.addItem({
        command: CommandIDs.rename,
        selector: selectorItem,
        rank: 4
    });
    app.contextMenu.addItem({
        command: CommandIDs.del,
        selector: selectorItem,
        rank: 5
    });
    app.contextMenu.addItem({
        command: CommandIDs.cut,
        selector: selectorItem,
        rank: 6
    });
    app.contextMenu.addItem({
        command: CommandIDs.copy,
        selector: selectorNotDir,
        rank: 7
    });
    app.contextMenu.addItem({
        command: CommandIDs.duplicate,
        selector: selectorNotDir,
        rank: 9
    });
    app.contextMenu.addItem({
        command: CommandIDs.download,
        selector: selectorNotDir,
        rank: 10
    });
    app.contextMenu.addItem({
        command: CommandIDs.shutdown,
        selector: selectorNotDir,
        rank: 11
    });
    app.contextMenu.addItem({
        command: CommandIDs.share,
        selector: selectorItem,
        rank: 12
    });
    app.contextMenu.addItem({
        command: CommandIDs.copyPath,
        selector: selectorItem,
        rank: 13
    });
    app.contextMenu.addItem({
        command: CommandIDs.copyDownloadLink,
        selector: selectorItem,
        rank: 14
    });
}
/**
 * Create a launcher for a given filebrowser widget.
 */
function createLauncher(commands, browser) {
    const { model } = browser;
    return commands
        .execute('launcher:create', { cwd: model.path })
        .then((launcher) => {
        model.pathChanged.connect(() => {
            launcher.content.cwd = model.path;
        }, launcher);
        return launcher;
    });
}
