"use strict";
/*-----------------------------------------------------------------------------
| Copyright (c) Jupyter Development Team.
| Distributed under the terms of the Modified BSD License.
|----------------------------------------------------------------------------*/
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const application_1 = require("@jupyterlab/application");
const apputils_1 = require("@jupyterlab/apputils");
const coreutils_1 = require("@jupyterlab/coreutils");
const mainmenu_1 = require("@jupyterlab/mainmenu");
const coreutils_2 = require("@phosphor/coreutils");
const disposable_1 = require("@phosphor/disposable");
const widgets_1 = require("@phosphor/widgets");
const palette_1 = require("./palette");
const redirect_1 = require("./redirect");
require("../style/index.css");
/**
 * The interval in milliseconds that calls to save a workspace are debounced
 * to allow for multiple quickly executed state changes to result in a single
 * workspace save operation.
 */
const WORKSPACE_SAVE_DEBOUNCE_INTERVAL = 750;
/**
 * The interval in milliseconds before recover options appear during splash.
 */
const SPLASH_RECOVER_TIMEOUT = 12000;
/**
 * The command IDs used by the apputils plugin.
 */
var CommandIDs;
(function (CommandIDs) {
    CommandIDs.changeTheme = 'apputils:change-theme';
    CommandIDs.loadState = 'apputils:load-statedb';
    CommandIDs.recoverState = 'apputils:recover-statedb';
    CommandIDs.reset = 'apputils:reset';
    CommandIDs.resetOnLoad = 'apputils:reset-on-load';
    CommandIDs.saveState = 'apputils:save-statedb';
})(CommandIDs || (CommandIDs = {}));
/**
 * The routing regular expressions used by the apputils plugin.
 */
var Patterns;
(function (Patterns) {
    Patterns.resetOnLoad = /(\?reset|\&reset)($|&)/;
    Patterns.workspace = new RegExp(`^${coreutils_1.PageConfig.getOption('workspacesUrl')}([^?\/]+)`);
})(Patterns || (Patterns = {}));
/**
 * A data connector to access plugin settings.
 */
class SettingsConnector extends coreutils_1.DataConnector {
    /**
     * Create a new settings connector.
     */
    constructor(manager) {
        super();
        this._manager = manager;
    }
    /**
     * Retrieve a saved bundle from the data connector.
     */
    fetch(id) {
        return this._manager.settings.fetch(id).then(data => {
            // Replace the server ID with the original unmodified version.
            data.id = id;
            return data;
        });
    }
    /**
     * Save the user setting data in the data connector.
     */
    save(id, raw) {
        return this._manager.settings.save(id, raw);
    }
}
/**
 * The default command palette extension.
 */
const palette = {
    activate: palette_1.activatePalette,
    id: '@jupyterlab/apputils-extension:palette',
    provides: apputils_1.ICommandPalette,
    autoStart: true
};
/**
 * The default command palette's restoration extension.
 *
 * #### Notes
 * The command palette's restoration logic is handled separately from the
 * command palette provider extension because the layout restorer dependency
 * causes the command palette to be unavailable to other extensions earlier
 * in the application load cycle.
 */
const paletteRestorer = {
    activate: palette_1.restorePalette,
    id: '@jupyterlab/apputils-extension:palette-restorer',
    requires: [application_1.ILayoutRestorer],
    autoStart: true
};
/**
 * The default setting registry provider.
 */
const settings = {
    id: '@jupyterlab/apputils-extension:settings',
    activate: (app) => {
        const connector = new SettingsConnector(app.serviceManager);
        return new coreutils_1.SettingRegistry({ connector });
    },
    autoStart: true,
    provides: coreutils_1.ISettingRegistry
};
/**
 * The default theme manager provider.
 */
const themes = {
    id: '@jupyterlab/apputils-extension:themes',
    requires: [coreutils_1.ISettingRegistry, apputils_1.ISplashScreen],
    optional: [apputils_1.ICommandPalette, mainmenu_1.IMainMenu],
    activate: (app, settings, splash, palette, mainMenu) => {
        const host = app.shell;
        const commands = app.commands;
        const url = coreutils_1.URLExt.join(app.info.urls.base, app.info.urls.themes);
        const key = themes.id;
        const manager = new apputils_1.ThemeManager({ key, host, settings, splash, url });
        // Keep a synchronously set reference to the current theme,
        // since the asynchronous setting of the theme in `changeTheme`
        // can lead to an incorrect toggle on the currently used theme.
        let currentTheme;
        // Set data attributes on the application shell for the current theme.
        manager.themeChanged.connect((sender, args) => {
            currentTheme = args.newValue;
            app.shell.dataset.themeLight = String(manager.isLight(currentTheme));
            app.shell.dataset.themeName = currentTheme;
            commands.notifyCommandChanged(CommandIDs.changeTheme);
        });
        commands.addCommand(CommandIDs.changeTheme, {
            label: args => {
                const theme = args['theme'];
                return args['isPalette'] ? `Use ${theme} Theme` : theme;
            },
            isToggled: args => args['theme'] === currentTheme,
            execute: args => {
                const theme = args['theme'];
                if (theme === manager.theme) {
                    return;
                }
                manager.setTheme(theme);
            }
        });
        // If we have a main menu, add the theme manager to the settings menu.
        if (mainMenu) {
            const themeMenu = new widgets_1.Menu({ commands });
            themeMenu.title.label = 'JupyterLab Theme';
            app.restored.then(() => {
                const command = CommandIDs.changeTheme;
                const isPalette = false;
                manager.themes.forEach(theme => {
                    themeMenu.addItem({ command, args: { isPalette, theme } });
                });
            });
            mainMenu.settingsMenu.addGroup([
                {
                    type: 'submenu',
                    submenu: themeMenu
                }
            ], 0);
        }
        // If we have a command palette, add theme switching options to it.
        if (palette) {
            app.restored.then(() => {
                const category = 'Settings';
                const command = CommandIDs.changeTheme;
                const isPalette = true;
                currentTheme = manager.theme;
                manager.themes.forEach(theme => {
                    palette.addItem({ command, args: { isPalette, theme }, category });
                });
            });
        }
        return manager;
    },
    autoStart: true,
    provides: apputils_1.IThemeManager
};
/**
 * The default window name resolver provider.
 */
const resolver = {
    id: '@jupyterlab/apputils-extension:resolver',
    autoStart: true,
    provides: apputils_1.IWindowResolver,
    requires: [application_1.IRouter],
    activate: (app, router) => __awaiter(this, void 0, void 0, function* () {
        const resolver = new apputils_1.WindowResolver();
        const match = router.current.path.match(Patterns.workspace);
        const workspace = (match && decodeURIComponent(match[1])) || '';
        const candidate = workspace
            ? coreutils_1.URLExt.join(coreutils_1.PageConfig.getOption('baseUrl'), coreutils_1.PageConfig.getOption('workspacesUrl'), workspace)
            : app.info.defaultWorkspace;
        try {
            yield resolver.resolve(candidate);
        }
        catch (error) {
            console.warn('Window resolution failed:', error);
            // Return a promise that never resolves.
            return new Promise(() => {
                Private.redirect(router);
            });
        }
        coreutils_1.PageConfig.setOption('workspace', resolver.name);
        return resolver;
    })
};
/**
 * The default splash screen provider.
 */
const splash = {
    id: '@jupyterlab/apputils-extension:splash',
    autoStart: true,
    provides: apputils_1.ISplashScreen,
    activate: app => {
        return {
            show: (light = true) => {
                const { commands, restored } = app;
                return Private.showSplash(restored, commands, CommandIDs.reset, light);
            }
        };
    }
};
/**
 * The default state database for storing application state.
 */
const state = {
    id: '@jupyterlab/apputils-extension:state',
    autoStart: true,
    provides: coreutils_1.IStateDB,
    requires: [application_1.IRouter, apputils_1.IWindowResolver, apputils_1.ISplashScreen],
    activate: (app, router, resolver, splash) => {
        let debouncer;
        let resolved = false;
        const { commands, info, serviceManager } = app;
        const { workspaces } = serviceManager;
        const transform = new coreutils_2.PromiseDelegate();
        const state = new coreutils_1.StateDB({
            namespace: info.namespace,
            transform: transform.promise,
            windowName: resolver.name
        });
        commands.addCommand(CommandIDs.recoverState, {
            execute: ({ global }) => __awaiter(this, void 0, void 0, function* () {
                const immediate = true;
                const silent = true;
                // Clear the state silently so that the state changed signal listener
                // will not be triggered as it causes a save state.
                yield state.clear(silent);
                // If the user explictly chooses to recover state, all of local storage
                // should be cleared.
                if (global) {
                    try {
                        window.localStorage.clear();
                        console.log('Cleared local storage');
                    }
                    catch (error) {
                        console.warn('Clearing local storage failed.', error);
                        // To give the user time to see the console warning before redirect,
                        // do not set the `immediate` flag.
                        return commands.execute(CommandIDs.saveState);
                    }
                }
                return commands.execute(CommandIDs.saveState, { immediate });
            })
        });
        // Conflate all outstanding requests to the save state command that happen
        // within the `WORKSPACE_SAVE_DEBOUNCE_INTERVAL` into a single promise.
        let conflated = null;
        commands.addCommand(CommandIDs.saveState, {
            label: () => `Save Workspace (${app.info.workspace})`,
            execute: ({ immediate }) => {
                const { workspace } = app.info;
                const timeout = immediate ? 0 : WORKSPACE_SAVE_DEBOUNCE_INTERVAL;
                const id = workspace;
                const metadata = { id };
                // Only instantiate a new conflated promise if one is not outstanding.
                if (!conflated) {
                    conflated = new coreutils_2.PromiseDelegate();
                }
                if (debouncer) {
                    window.clearTimeout(debouncer);
                }
                debouncer = window.setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                    // Prevent a race condition between the timeout and saving.
                    if (!conflated) {
                        return;
                    }
                    const data = yield state.toJSON();
                    try {
                        yield workspaces.save(id, { data, metadata });
                        conflated.resolve(undefined);
                    }
                    catch (error) {
                        conflated.reject(error);
                    }
                    conflated = null;
                }), timeout);
                return conflated.promise;
            }
        });
        const listener = (sender, change) => {
            commands.execute(CommandIDs.saveState);
        };
        commands.addCommand(CommandIDs.loadState, {
            execute: (args) => __awaiter(this, void 0, void 0, function* () {
                // Since the command can be executed an arbitrary number of times, make
                // sure it is safe to call multiple times.
                if (resolved) {
                    return;
                }
                const { hash, path, search } = args;
                const { defaultWorkspace, workspace } = app.info;
                const query = coreutils_1.URLExt.queryStringToObject(search || '');
                const clone = typeof query['clone'] === 'string'
                    ? query['clone'] === ''
                        ? defaultWorkspace
                        : coreutils_1.URLExt.join(coreutils_1.PageConfig.getOption('baseUrl'), coreutils_1.PageConfig.getOption('workspacesUrl'), query['clone'])
                    : null;
                const source = clone || workspace;
                try {
                    const saved = yield workspaces.fetch(source);
                    // If this command is called after a reset, the state database
                    // will already be resolved.
                    if (!resolved) {
                        resolved = true;
                        transform.resolve({ type: 'overwrite', contents: saved.data });
                    }
                }
                catch (error) {
                    console.warn(`Fetching workspace (${workspace}) failed:`, error);
                    // If the workspace does not exist, cancel the data transformation
                    // and save a workspace with the current user state data.
                    if (!resolved) {
                        resolved = true;
                        transform.resolve({ type: 'cancel', contents: null });
                    }
                }
                // Any time the local state database changes, save the workspace.
                if (workspace) {
                    state.changed.connect(listener, state);
                }
                const immediate = true;
                if (source === clone) {
                    // Maintain the query string parameters but remove `clone`.
                    delete query['clone'];
                    const url = path + coreutils_1.URLExt.objectToQueryString(query) + hash;
                    const cloned = commands
                        .execute(CommandIDs.saveState, { immediate })
                        .then(() => router.stop);
                    // After the state has been cloned, navigate to the URL.
                    cloned.then(() => {
                        console.log(`HERE: ${url}`);
                        router.navigate(url, { silent: true });
                    });
                    return cloned;
                }
                // After the state database has finished loading, save it.
                return commands.execute(CommandIDs.saveState, { immediate });
            })
        });
        router.register({
            command: CommandIDs.loadState,
            pattern: /.?/,
            rank: 20 // Very high priority: 20/100.
        });
        commands.addCommand(CommandIDs.reset, {
            label: 'Reset Application State',
            execute: () => __awaiter(this, void 0, void 0, function* () {
                const global = true;
                try {
                    yield commands.execute(CommandIDs.recoverState, { global });
                }
                catch (error) {
                    /* Ignore failures and redirect. */
                }
                router.reload();
            })
        });
        commands.addCommand(CommandIDs.resetOnLoad, {
            execute: (args) => {
                const { hash, path, search } = args;
                const query = coreutils_1.URLExt.queryStringToObject(search || '');
                const reset = 'reset' in query;
                const clone = 'clone' in query;
                if (!reset) {
                    return;
                }
                const loading = splash.show();
                // If the state database has already been resolved, resetting is
                // impossible without reloading.
                if (resolved) {
                    return router.reload();
                }
                // Empty the state database.
                resolved = true;
                transform.resolve({ type: 'clear', contents: null });
                // Maintain the query string parameters but remove `reset`.
                delete query['reset'];
                const silent = true;
                const hard = true;
                const url = path + coreutils_1.URLExt.objectToQueryString(query) + hash;
                const cleared = commands
                    .execute(CommandIDs.recoverState)
                    .then(() => router.stop); // Stop routing before new route navigation.
                // After the state has been reset, navigate to the URL.
                if (clone) {
                    cleared.then(() => {
                        router.navigate(url, { silent, hard });
                    });
                }
                else {
                    cleared.then(() => {
                        router.navigate(url, { silent });
                        loading.dispose();
                    });
                }
                return cleared;
            }
        });
        router.register({
            command: CommandIDs.resetOnLoad,
            pattern: Patterns.resetOnLoad,
            rank: 10 // Set reset rank at a higher priority than the default 100.
        });
        // Clean up state database when the window unloads.
        window.addEventListener('beforeunload', () => {
            const silent = true;
            state.clear(silent).catch(() => {
                /* no-op */
            });
        });
        return state;
    }
};
/**
 * Export the plugins as default.
 */
const plugins = [
    palette,
    paletteRestorer,
    resolver,
    settings,
    state,
    splash,
    themes
];
exports.default = plugins;
/**
 * The namespace for module private data.
 */
var Private;
(function (Private) {
    /**
     * Create a splash element.
     */
    function createSplash() {
        const splash = document.createElement('div');
        const galaxy = document.createElement('div');
        const logo = document.createElement('div');
        splash.id = 'jupyterlab-splash';
        galaxy.id = 'galaxy';
        logo.id = 'main-logo';
        galaxy.appendChild(logo);
        ['1', '2', '3'].forEach(id => {
            const moon = document.createElement('div');
            const planet = document.createElement('div');
            moon.id = `moon${id}`;
            moon.className = 'moon orbit';
            planet.id = `planet${id}`;
            planet.className = 'planet';
            moon.appendChild(planet);
            galaxy.appendChild(moon);
        });
        splash.appendChild(galaxy);
        return splash;
    }
    /**
     * A debouncer for recovery attempts.
     */
    let debouncer = 0;
    /**
     * The recovery dialog.
     */
    let dialog;
    /**
     * Allows the user to clear state if splash screen takes too long.
     */
    function recover(fn) {
        if (dialog) {
            return;
        }
        dialog = new apputils_1.Dialog({
            title: 'Loading...',
            body: `The loading screen is taking a long time.
        Would you like to clear the workspace or keep waiting?`,
            buttons: [
                apputils_1.Dialog.cancelButton({ label: 'Keep Waiting' }),
                apputils_1.Dialog.warnButton({ label: 'Clear Workspace' })
            ]
        });
        dialog
            .launch()
            .then(result => {
            if (result.button.accept) {
                return fn();
            }
            dialog.dispose();
            dialog = null;
            debouncer = window.setTimeout(() => {
                recover(fn);
            }, SPLASH_RECOVER_TIMEOUT);
        })
            .catch(() => {
            /* no-op */
        });
    }
    /**
     * Allows the user to clear state if splash screen takes too long.
     */
    function redirect(router, warn = false) {
        return __awaiter(this, void 0, void 0, function* () {
            const form = redirect_1.createRedirectForm(warn);
            const dialog = new apputils_1.Dialog({
                title: 'Please use a different workspace.',
                body: form,
                focusNodeSelector: 'input',
                buttons: [apputils_1.Dialog.okButton({ label: 'Switch Workspace' })]
            });
            const result = yield dialog.launch();
            dialog.dispose();
            if (!result.value) {
                return redirect(router, true);
            }
            // Navigate to a new workspace URL and abandon this session altogether.
            const workspaces = coreutils_1.PageConfig.getOption('workspacesUrl');
            const url = coreutils_1.URLExt.join(workspaces, result.value);
            router.navigate(url, { hard: true, silent: true });
            // This promise will never resolve because the application navigates
            // away to a new location. It only exists to satisfy the return type
            // of the `redirect` function.
            return new Promise(() => undefined);
        });
    }
    Private.redirect = redirect;
    /**
     * The splash element.
     */
    const splash = createSplash();
    /**
     * The splash screen counter.
     */
    let splashCount = 0;
    /**
     * Show the splash element.
     *
     * @param ready - A promise that must be resolved before splash disappears.
     *
     * @param recovery - A command that recovers from a hanging splash.
     */
    function showSplash(ready, commands, recovery, light) {
        splash.classList.remove('splash-fade');
        splash.classList.toggle('light', light);
        splash.classList.toggle('dark', !light);
        splashCount++;
        if (debouncer) {
            window.clearTimeout(debouncer);
        }
        debouncer = window.setTimeout(() => {
            if (commands.hasCommand(recovery)) {
                recover(() => {
                    commands.execute(recovery);
                });
            }
        }, SPLASH_RECOVER_TIMEOUT);
        document.body.appendChild(splash);
        return new disposable_1.DisposableDelegate(() => {
            ready.then(() => {
                if (--splashCount === 0) {
                    if (debouncer) {
                        window.clearTimeout(debouncer);
                        debouncer = 0;
                    }
                    if (dialog) {
                        dialog.dispose();
                        dialog = null;
                    }
                    splash.classList.add('splash-fade');
                    window.setTimeout(() => {
                        document.body.removeChild(splash);
                    }, 500);
                }
            });
        });
    }
    Private.showSplash = showSplash;
})(Private || (Private = {}));
