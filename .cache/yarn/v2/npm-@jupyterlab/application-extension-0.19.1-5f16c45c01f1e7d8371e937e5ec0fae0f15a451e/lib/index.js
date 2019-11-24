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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const application_1 = require("@jupyterlab/application");
const apputils_1 = require("@jupyterlab/apputils");
const coreutils_1 = require("@jupyterlab/coreutils");
const algorithm_1 = require("@phosphor/algorithm");
const React = __importStar(require("react"));
/**
 * The command IDs used by the application plugin.
 */
var CommandIDs;
(function (CommandIDs) {
    CommandIDs.activateNextTab = 'application:activate-next-tab';
    CommandIDs.activatePreviousTab = 'application:activate-previous-tab';
    CommandIDs.closeAll = 'application:close-all';
    CommandIDs.setMode = 'application:set-mode';
    CommandIDs.toggleMode = 'application:toggle-mode';
    CommandIDs.toggleLeftArea = 'application:toggle-left-area';
    CommandIDs.toggleRightArea = 'application:toggle-right-area';
    CommandIDs.togglePresentationMode = 'application:toggle-presentation-mode';
    CommandIDs.tree = 'router:tree';
    CommandIDs.switchSidebar = 'sidebar:switch';
})(CommandIDs || (CommandIDs = {}));
/**
 * The routing regular expressions used by the application plugin.
 */
var Patterns;
(function (Patterns) {
    Patterns.tree = new RegExp(`^${coreutils_1.PageConfig.getOption('treeUrl')}([^?]+)`);
    Patterns.workspace = new RegExp(`^${coreutils_1.PageConfig.getOption('workspacesUrl')}[^?\/]+/tree/([^?]+)`);
})(Patterns || (Patterns = {}));
/**
 * The main extension.
 */
const main = {
    id: '@jupyterlab/application-extension:main',
    requires: [apputils_1.ICommandPalette, application_1.IRouter, apputils_1.IWindowResolver],
    activate: (app, palette, router, resolver) => {
        // Requiring the window resolver guarantees that the application extension
        // only loads if there is a viable window name. Otherwise, the application
        // will short-circuit and ask the user to navigate away.
        const workspace = resolver.name;
        console.log(`Starting application in workspace: ${workspace}`);
        // If there were errors registering plugins, tell the user.
        if (app.registerPluginErrors.length !== 0) {
            const body = (React.createElement("pre", null, app.registerPluginErrors.map(e => e.message).join('\n')));
            apputils_1.showErrorMessage('Error Registering Plugins', { message: body });
        }
        addCommands(app, palette);
        // If the application shell layout is modified,
        // trigger a refresh of the commands.
        app.shell.layoutModified.connect(() => {
            app.commands.notifyCommandChanged();
        });
        const builder = app.serviceManager.builder;
        const build = () => {
            return builder
                .build()
                .then(() => {
                return apputils_1.showDialog({
                    title: 'Build Complete',
                    body: 'Build successfully completed, reload page?',
                    buttons: [
                        apputils_1.Dialog.cancelButton(),
                        apputils_1.Dialog.warnButton({ label: 'RELOAD' })
                    ]
                });
            })
                .then(result => {
                if (result.button.accept) {
                    router.reload();
                }
            })
                .catch(err => {
                apputils_1.showErrorMessage('Build Failed', {
                    message: React.createElement("pre", null, err.message)
                });
            });
        };
        if (builder.isAvailable && builder.shouldCheck) {
            builder.getStatus().then(response => {
                if (response.status === 'building') {
                    return build();
                }
                if (response.status !== 'needed') {
                    return;
                }
                const body = (React.createElement("div", null,
                    React.createElement("p", null,
                        "JupyterLab build is suggested:",
                        React.createElement("br", null),
                        React.createElement("pre", null, response.message))));
                apputils_1.showDialog({
                    title: 'Build Recommended',
                    body,
                    buttons: [apputils_1.Dialog.cancelButton(), apputils_1.Dialog.okButton({ label: 'BUILD' })]
                }).then(result => (result.button.accept ? build() : undefined));
            });
        }
        const message = 'Are you sure you want to exit JupyterLab?\n' +
            'Any unsaved changes will be lost.';
        // The spec for the `beforeunload` event is implemented differently by
        // the different browser vendors. Consequently, the `event.returnValue`
        // attribute needs to set in addition to a return value being returned.
        // For more information, see:
        // https://developer.mozilla.org/en/docs/Web/Events/beforeunload
        window.addEventListener('beforeunload', event => {
            if (app.isDirty) {
                return (event.returnValue = message);
            }
        });
    },
    autoStart: true
};
/**
 * The default layout restorer provider.
 */
const layout = {
    id: '@jupyterlab/application-extension:layout',
    requires: [coreutils_1.IStateDB],
    activate: (app, state) => {
        const first = app.started;
        const registry = app.commands;
        const restorer = new application_1.LayoutRestorer({ first, registry, state });
        restorer.fetch().then(saved => {
            app.shell.restoreLayout(saved);
            app.shell.layoutModified.connect(() => {
                restorer.save(app.shell.saveLayout());
            });
        });
        return restorer;
    },
    autoStart: true,
    provides: application_1.ILayoutRestorer
};
/**
 * The default URL router provider.
 */
const router = {
    id: '@jupyterlab/application-extension:router',
    activate: (app) => {
        const { commands } = app;
        const base = coreutils_1.PageConfig.getOption('baseUrl');
        const router = new application_1.Router({ base, commands });
        app.started.then(() => {
            // Route the very first request on load.
            router.route();
            // Route all pop state events.
            window.addEventListener('popstate', () => {
                router.route();
            });
        });
        return router;
    },
    autoStart: true,
    provides: application_1.IRouter
};
/**
 * The tree route handler provider.
 */
const tree = {
    id: '@jupyterlab/application-extension:tree',
    autoStart: true,
    requires: [application_1.IRouter],
    activate: (app, router) => {
        const { commands } = app;
        commands.addCommand(CommandIDs.tree, {
            execute: (args) => __awaiter(this, void 0, void 0, function* () {
                const treeMatch = args.path.match(Patterns.tree);
                const workspaceMatch = args.path.match(Patterns.workspace);
                const match = treeMatch || workspaceMatch;
                const path = decodeURI(match[1]);
                const { page, workspaces } = app.info.urls;
                const workspace = coreutils_1.PathExt.basename(app.info.workspace);
                const url = (workspaceMatch ? coreutils_1.URLExt.join(workspaces, workspace) : page) +
                    args.search +
                    args.hash;
                const immediate = true;
                const silent = true;
                // Silently remove the tree portion of the URL leaving the rest intact.
                router.navigate(url, { silent });
                try {
                    yield commands.execute('filebrowser:navigate', { path });
                    yield commands.execute('apputils:save-statedb', { immediate });
                }
                catch (error) {
                    console.warn('Tree routing failed.', error);
                }
            })
        });
        router.register({ command: CommandIDs.tree, pattern: Patterns.tree });
        router.register({ command: CommandIDs.tree, pattern: Patterns.workspace });
    }
};
/**
 * The default URL not found extension.
 */
const notfound = {
    id: '@jupyterlab/application-extension:notfound',
    activate: (app, router) => {
        const bad = coreutils_1.PageConfig.getOption('notFoundUrl');
        const base = router.base;
        const message = `
      The path: ${bad} was not found. JupyterLab redirected to: ${base}
    `;
        if (!bad) {
            return;
        }
        // Change the URL back to the base application URL without adding the
        // URL change to the browser history.
        router.navigate('', { silent: true });
        apputils_1.showErrorMessage('Path Not Found', { message });
    },
    requires: [application_1.IRouter],
    autoStart: true
};
/**
 * Change the favicon changing based on the busy status;
 */
const busy = {
    id: '@jupyterlab/application-extension:faviconbusy',
    activate: (app) => __awaiter(this, void 0, void 0, function* () {
        app.busySignal.connect((_, isBusy) => {
            const favicon = document.querySelector(`link[rel="icon"]${isBusy ? '.idle.favicon' : '.busy.favicon'}`);
            if (!favicon) {
                return;
            }
            const newFavicon = document.querySelector(`link${isBusy ? '.busy.favicon' : '.idle.favicon'}`);
            if (!newFavicon) {
                return;
            }
            // If we have the two icons with the special classes, then toggle them.
            if (favicon !== newFavicon) {
                favicon.rel = '';
                newFavicon.rel = 'icon';
                // Firefox doesn't seem to recognize just changing rel, so we also
                // reinsert the link into the DOM.
                newFavicon.parentNode.replaceChild(newFavicon, newFavicon);
            }
        });
    }),
    requires: [],
    autoStart: true
};
const SIDEBAR_ID = '@jupyterlab/application-extension:sidebar';
/**
 * Keep user settings for where to show the side panels.
 */
const sidebar = {
    id: SIDEBAR_ID,
    activate: (app, settingRegistry) => {
        let overrides = {};
        const handleLayoutOverrides = () => {
            algorithm_1.each(app.shell.widgets('left'), widget => {
                if (overrides[widget.id] && overrides[widget.id] === 'right') {
                    app.shell.addToRightArea(widget);
                }
            });
            algorithm_1.each(app.shell.widgets('right'), widget => {
                if (overrides[widget.id] && overrides[widget.id] === 'left') {
                    app.shell.addToLeftArea(widget);
                }
            });
        };
        app.shell.layoutModified.connect(handleLayoutOverrides);
        // Fetch overrides from the settings system.
        Promise.all([settingRegistry.load(SIDEBAR_ID), app.restored]).then(([settings]) => {
            overrides = settings.get('overrides').composite || {};
            settings.changed.connect(settings => {
                overrides =
                    settings.get('overrides').composite || {};
                handleLayoutOverrides();
            });
        });
        // Add a command to switch a side panels's side
        app.commands.addCommand(CommandIDs.switchSidebar, {
            label: 'Switch Sidebar Side',
            execute: () => {
                // First, try to find the right panel based on the
                // application context menu click,
                // If we can't find it there, look for use the active
                // left/right widgets.
                const contextNode = app.contextMenuFirst(node => !!node.dataset.id);
                let id;
                let side;
                if (contextNode) {
                    id = contextNode.dataset['id'];
                    const leftPanel = document.getElementById('jp-left-stack');
                    const node = document.getElementById(id);
                    if (leftPanel && node && leftPanel.contains(node)) {
                        side = 'right';
                    }
                    else {
                        side = 'left';
                    }
                }
                else if (document.body.dataset.leftSidebarWidget) {
                    id = document.body.dataset.leftSidebarWidget;
                    side = 'right';
                }
                else if (document.body.dataset.rightSidebarWidget) {
                    id = document.body.dataset.rightSidebarWidget;
                    side = 'left';
                }
                // Move the panel to the other side.
                const newOverrides = Object.assign({}, overrides);
                newOverrides[id] = side;
                settingRegistry.set(SIDEBAR_ID, 'overrides', newOverrides);
            }
        });
        // Add a context menu item to sidebar tabs.
        app.contextMenu.addItem({
            command: CommandIDs.switchSidebar,
            selector: '.jp-SideBar .p-TabBar-tab',
            rank: 500
        });
    },
    requires: [coreutils_1.ISettingRegistry],
    autoStart: true
};
/**
 * Add the main application commands.
 */
function addCommands(app, palette) {
    const category = 'Main Area';
    let command = CommandIDs.activateNextTab;
    app.commands.addCommand(command, {
        label: 'Activate Next Tab',
        execute: () => {
            app.shell.activateNextTab();
        }
    });
    palette.addItem({ command, category });
    command = CommandIDs.activatePreviousTab;
    app.commands.addCommand(command, {
        label: 'Activate Previous Tab',
        execute: () => {
            app.shell.activatePreviousTab();
        }
    });
    palette.addItem({ command, category });
    command = CommandIDs.closeAll;
    app.commands.addCommand(command, {
        label: 'Close All Widgets',
        execute: () => {
            app.shell.closeAll();
        }
    });
    palette.addItem({ command, category });
    command = CommandIDs.toggleLeftArea;
    app.commands.addCommand(command, {
        label: args => 'Show Left Sidebar',
        execute: () => {
            if (app.shell.leftCollapsed) {
                app.shell.expandLeft();
            }
            else {
                app.shell.collapseLeft();
                if (app.shell.currentWidget) {
                    app.shell.activateById(app.shell.currentWidget.id);
                }
            }
        },
        isToggled: () => !app.shell.leftCollapsed,
        isVisible: () => !app.shell.isEmpty('left')
    });
    palette.addItem({ command, category });
    command = CommandIDs.toggleRightArea;
    app.commands.addCommand(command, {
        label: args => 'Show Right Sidebar',
        execute: () => {
            if (app.shell.rightCollapsed) {
                app.shell.expandRight();
            }
            else {
                app.shell.collapseRight();
                if (app.shell.currentWidget) {
                    app.shell.activateById(app.shell.currentWidget.id);
                }
            }
        },
        isToggled: () => !app.shell.rightCollapsed,
        isVisible: () => !app.shell.isEmpty('right')
    });
    palette.addItem({ command, category });
    command = CommandIDs.togglePresentationMode;
    app.commands.addCommand(command, {
        label: args => 'Presentation Mode',
        execute: () => {
            app.shell.presentationMode = !app.shell.presentationMode;
        },
        isToggled: () => app.shell.presentationMode,
        isVisible: () => true
    });
    palette.addItem({ command, category });
    command = CommandIDs.setMode;
    app.commands.addCommand(command, {
        isVisible: args => {
            const mode = args['mode'];
            return mode === 'single-document' || mode === 'multiple-document';
        },
        execute: args => {
            const mode = args['mode'];
            if (mode === 'single-document' || mode === 'multiple-document') {
                app.shell.mode = mode;
                return;
            }
            throw new Error(`Unsupported application shell mode: ${mode}`);
        }
    });
    command = CommandIDs.toggleMode;
    app.commands.addCommand(command, {
        label: 'Single-Document Mode',
        isToggled: () => app.shell.mode === 'single-document',
        execute: () => {
            const args = app.shell.mode === 'multiple-document'
                ? { mode: 'single-document' }
                : { mode: 'multiple-document' };
            return app.commands.execute(CommandIDs.setMode, args);
        }
    });
    palette.addItem({ command, category });
}
/**
 * Export the plugins as default.
 */
const plugins = [
    main,
    layout,
    router,
    tree,
    notfound,
    busy,
    sidebar
];
exports.default = plugins;
