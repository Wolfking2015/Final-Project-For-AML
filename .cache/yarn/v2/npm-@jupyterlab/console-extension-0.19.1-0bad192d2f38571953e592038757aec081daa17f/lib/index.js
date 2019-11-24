"use strict";
// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
Object.defineProperty(exports, "__esModule", { value: true });
const application_1 = require("@jupyterlab/application");
const apputils_1 = require("@jupyterlab/apputils");
const codeeditor_1 = require("@jupyterlab/codeeditor");
const console_1 = require("@jupyterlab/console");
const coreutils_1 = require("@jupyterlab/coreutils");
const filebrowser_1 = require("@jupyterlab/filebrowser");
const launcher_1 = require("@jupyterlab/launcher");
const mainmenu_1 = require("@jupyterlab/mainmenu");
const rendermime_1 = require("@jupyterlab/rendermime");
const algorithm_1 = require("@phosphor/algorithm");
const coreutils_2 = require("@phosphor/coreutils");
const widgets_1 = require("@phosphor/widgets");
/**
 * The command IDs used by the console plugin.
 */
var CommandIDs;
(function (CommandIDs) {
    CommandIDs.create = 'console:create';
    CommandIDs.clear = 'console:clear';
    CommandIDs.runUnforced = 'console:run-unforced';
    CommandIDs.runForced = 'console:run-forced';
    CommandIDs.linebreak = 'console:linebreak';
    CommandIDs.interrupt = 'console:interrupt-kernel';
    CommandIDs.restart = 'console:restart-kernel';
    CommandIDs.closeAndShutdown = 'console:close-and-shutdown';
    CommandIDs.open = 'console:open';
    CommandIDs.inject = 'console:inject';
    CommandIDs.changeKernel = 'console:change-kernel';
    CommandIDs.toggleShowAllActivity = 'console:toggle-show-all-kernel-activity';
    CommandIDs.enterToExecute = 'console:enter-to-execute';
    CommandIDs.shiftEnterToExecute = 'console:shift-enter-to-execute';
})(CommandIDs || (CommandIDs = {}));
/**
 * The console widget tracker provider.
 */
const tracker = {
    id: '@jupyterlab/console-extension:tracker',
    provides: console_1.IConsoleTracker,
    requires: [
        mainmenu_1.IMainMenu,
        apputils_1.ICommandPalette,
        console_1.ConsolePanel.IContentFactory,
        codeeditor_1.IEditorServices,
        application_1.ILayoutRestorer,
        filebrowser_1.IFileBrowserFactory,
        rendermime_1.IRenderMimeRegistry,
        coreutils_1.ISettingRegistry
    ],
    optional: [launcher_1.ILauncher],
    activate: activateConsole,
    autoStart: true
};
/**
 * The console widget content factory.
 */
const factory = {
    id: '@jupyterlab/console-extension:factory',
    provides: console_1.ConsolePanel.IContentFactory,
    requires: [codeeditor_1.IEditorServices],
    autoStart: true,
    activate: (app, editorServices) => {
        const editorFactory = editorServices.factoryService.newInlineEditor;
        return new console_1.ConsolePanel.ContentFactory({ editorFactory });
    }
};
/**
 * Export the plugins as the default.
 */
const plugins = [factory, tracker];
exports.default = plugins;
/**
 * Activate the console extension.
 */
function activateConsole(app, mainMenu, palette, contentFactory, editorServices, restorer, browserFactory, rendermime, settingRegistry, launcher) {
    const manager = app.serviceManager;
    const { commands, shell } = app;
    const category = 'Console';
    // Create an instance tracker for all console panels.
    const tracker = new apputils_1.InstanceTracker({ namespace: 'console' });
    // Handle state restoration.
    restorer.restore(tracker, {
        command: CommandIDs.open,
        args: panel => ({
            path: panel.console.session.path,
            name: panel.console.session.name
        }),
        name: panel => panel.console.session.path,
        when: manager.ready
    });
    // Add a launcher item if the launcher is available.
    if (launcher) {
        manager.ready.then(() => {
            const specs = manager.specs;
            if (!specs) {
                return;
            }
            let baseUrl = coreutils_1.PageConfig.getBaseUrl();
            for (let name in specs.kernelspecs) {
                let rank = name === specs.default ? 0 : Infinity;
                let kernelIconUrl = specs.kernelspecs[name].resources['logo-64x64'];
                if (kernelIconUrl) {
                    let index = kernelIconUrl.indexOf('kernelspecs');
                    kernelIconUrl = baseUrl + kernelIconUrl.slice(index);
                }
                launcher.add({
                    command: CommandIDs.create,
                    args: { isLauncher: true, kernelPreference: { name } },
                    category: 'Console',
                    rank,
                    kernelIconUrl
                });
            }
        });
    }
    /**
     * Create a console for a given path.
     */
    function createConsole(options) {
        let panel;
        return manager.ready
            .then(() => {
            panel = new console_1.ConsolePanel(Object.assign({ manager,
                contentFactory, mimeTypeService: editorServices.mimeTypeService, rendermime, setBusy: app.setBusy.bind(app) }, options));
            return panel.session.ready;
        })
            .then(() => {
            // Add the console panel to the tracker.
            tracker.add(panel);
            panel.session.propertyChanged.connect(() => tracker.save(panel));
            shell.addToMainArea(panel, {
                ref: options.ref,
                mode: options.insertMode,
                activate: options.activate
            });
            return panel;
        });
    }
    /**
     * Whether there is an active console.
     */
    function isEnabled() {
        return (tracker.currentWidget !== null &&
            tracker.currentWidget === app.shell.currentWidget);
    }
    let command = CommandIDs.open;
    commands.addCommand(command, {
        execute: (args) => {
            let path = args['path'];
            let widget = tracker.find(value => {
                return value.console.session.path === path;
            });
            if (widget) {
                if (args['activate'] !== false) {
                    shell.activateById(widget.id);
                }
                return widget;
            }
            else {
                return manager.ready.then(() => {
                    let model = algorithm_1.find(manager.sessions.running(), item => {
                        return item.path === path;
                    });
                    if (model) {
                        return createConsole(args);
                    }
                    return Promise.reject(`No running kernel session for path: ${path}`);
                });
            }
        }
    });
    command = CommandIDs.create;
    commands.addCommand(command, {
        label: args => {
            if (args['isPalette']) {
                return 'New Console';
            }
            else if (args['isLauncher'] && args['kernelPreference']) {
                const kernelPreference = args['kernelPreference'];
                return manager.specs.kernelspecs[kernelPreference.name].display_name;
            }
            return 'Console';
        },
        iconClass: args => (args['isPalette'] ? '' : 'jp-CodeConsoleIcon'),
        execute: args => {
            let basePath = args['basePath'] ||
                args['cwd'] ||
                browserFactory.defaultBrowser.model.path;
            return createConsole(Object.assign({ basePath }, args));
        }
    });
    // Get the current widget and activate unless the args specify otherwise.
    function getCurrent(args) {
        let widget = tracker.currentWidget;
        let activate = args['activate'] !== false;
        if (activate && widget) {
            shell.activateById(widget.id);
        }
        return widget;
    }
    commands.addCommand(CommandIDs.clear, {
        label: 'Clear Console Cells',
        execute: args => {
            let current = getCurrent(args);
            if (!current) {
                return;
            }
            current.console.clear();
        },
        isEnabled
    });
    commands.addCommand(CommandIDs.runUnforced, {
        label: 'Run Cell (unforced)',
        execute: args => {
            let current = getCurrent(args);
            if (!current) {
                return;
            }
            return current.console.execute();
        },
        isEnabled
    });
    commands.addCommand(CommandIDs.runForced, {
        label: 'Run Cell (forced)',
        execute: args => {
            let current = getCurrent(args);
            if (!current) {
                return;
            }
            current.console.execute(true);
        },
        isEnabled
    });
    commands.addCommand(CommandIDs.linebreak, {
        label: 'Insert Line Break',
        execute: args => {
            let current = getCurrent(args);
            if (!current) {
                return;
            }
            current.console.insertLinebreak();
        },
        isEnabled
    });
    commands.addCommand(CommandIDs.interrupt, {
        label: 'Interrupt Kernel',
        execute: args => {
            let current = getCurrent(args);
            if (!current) {
                return;
            }
            let kernel = current.console.session.kernel;
            if (kernel) {
                return kernel.interrupt();
            }
        },
        isEnabled
    });
    commands.addCommand(CommandIDs.restart, {
        label: 'Restart Kernel…',
        execute: args => {
            let current = getCurrent(args);
            if (!current) {
                return;
            }
            return current.console.session.restart();
        },
        isEnabled
    });
    commands.addCommand(CommandIDs.closeAndShutdown, {
        label: 'Close and Shutdown…',
        execute: args => {
            const current = getCurrent(args);
            if (!current) {
                return;
            }
            return apputils_1.showDialog({
                title: 'Shutdown the console?',
                body: `Are you sure you want to close "${current.title.label}"?`,
                buttons: [apputils_1.Dialog.cancelButton(), apputils_1.Dialog.warnButton()]
            }).then(result => {
                if (result.button.accept) {
                    current.console.session.shutdown().then(() => {
                        current.dispose();
                    });
                }
                else {
                    return false;
                }
            });
        },
        isEnabled
    });
    commands.addCommand(CommandIDs.inject, {
        execute: args => {
            let path = args['path'];
            tracker.find(widget => {
                if (widget.console.session.path === path) {
                    if (args['activate'] !== false) {
                        shell.activateById(widget.id);
                    }
                    widget.console.inject(args['code']);
                    return true;
                }
                return false;
            });
        },
        isEnabled
    });
    commands.addCommand(CommandIDs.changeKernel, {
        label: 'Change Kernel…',
        execute: args => {
            let current = getCurrent(args);
            if (!current) {
                return;
            }
            return current.console.session.selectKernel();
        },
        isEnabled
    });
    commands.addCommand(CommandIDs.toggleShowAllActivity, {
        label: args => 'Show All Kernel Activity',
        execute: args => {
            let current = getCurrent(args);
            if (!current) {
                return;
            }
            current.console.showAllActivity = !current.console.showAllActivity;
        },
        isToggled: () => tracker.currentWidget
            ? tracker.currentWidget.console.showAllActivity
            : false,
        isEnabled
    });
    // Constants for setting the shortcuts for executing console cells.
    const shortcutPlugin = '@jupyterlab/shortcuts-extension:plugin';
    const selector = '.jp-CodeConsole-promptCell';
    // Keep updated keybindings for the console commands related to execution.
    let linebreak = algorithm_1.find(commands.keyBindings, kb => kb.command === CommandIDs.linebreak);
    let runUnforced = algorithm_1.find(commands.keyBindings, kb => kb.command === CommandIDs.runUnforced);
    let runForced = algorithm_1.find(commands.keyBindings, kb => kb.command === CommandIDs.runForced);
    commands.keyBindingChanged.connect((s, args) => {
        if (args.binding.command === CommandIDs.linebreak) {
            linebreak = args.type === 'added' ? args.binding : undefined;
            return;
        }
        if (args.binding.command === CommandIDs.runUnforced) {
            runUnforced = args.type === 'added' ? args.binding : undefined;
            return;
        }
        if (args.binding.command === CommandIDs.runForced) {
            runForced = args.type === 'added' ? args.binding : undefined;
            return;
        }
    });
    commands.addCommand(CommandIDs.shiftEnterToExecute, {
        label: 'Execute with Shift+Enter',
        isToggled: () => {
            // Only show as toggled if the shortcuts are strictly
            // The Shift+Enter ones.
            return (linebreak &&
                coreutils_2.JSONExt.deepEqual(linebreak.keys, ['Enter']) &&
                runUnforced === undefined &&
                runForced &&
                coreutils_2.JSONExt.deepEqual(runForced.keys, ['Shift Enter']));
        },
        execute: () => {
            const first = settingRegistry.set(shortcutPlugin, CommandIDs.linebreak, {
                command: CommandIDs.linebreak,
                keys: ['Enter'],
                selector
            });
            const second = settingRegistry.remove(shortcutPlugin, CommandIDs.runUnforced);
            const third = settingRegistry.set(shortcutPlugin, CommandIDs.runForced, {
                command: CommandIDs.runForced,
                keys: ['Shift Enter'],
                selector
            });
            return Promise.all([first, second, third]);
        }
    });
    commands.addCommand(CommandIDs.enterToExecute, {
        label: 'Execute with Enter',
        isToggled: () => {
            // Only show as toggled if the shortcuts are strictly
            // The Enter ones.
            return (linebreak &&
                coreutils_2.JSONExt.deepEqual(linebreak.keys, ['Ctrl Enter']) &&
                runUnforced &&
                coreutils_2.JSONExt.deepEqual(runUnforced.keys, ['Enter']) &&
                runForced &&
                coreutils_2.JSONExt.deepEqual(runForced.keys, ['Shift Enter']));
        },
        execute: () => {
            const first = settingRegistry.set(shortcutPlugin, CommandIDs.linebreak, {
                command: CommandIDs.linebreak,
                keys: ['Ctrl Enter'],
                selector
            });
            const second = settingRegistry.set(shortcutPlugin, CommandIDs.runUnforced, {
                command: CommandIDs.runUnforced,
                keys: ['Enter'],
                selector
            });
            const third = settingRegistry.set(shortcutPlugin, CommandIDs.runForced, {
                command: CommandIDs.runForced,
                keys: ['Shift Enter'],
                selector
            });
            return Promise.all([first, second, third]);
        }
    });
    // Add command palette items
    [
        CommandIDs.create,
        CommandIDs.linebreak,
        CommandIDs.clear,
        CommandIDs.runUnforced,
        CommandIDs.runForced,
        CommandIDs.restart,
        CommandIDs.interrupt,
        CommandIDs.changeKernel,
        CommandIDs.closeAndShutdown,
        CommandIDs.toggleShowAllActivity
    ].forEach(command => {
        palette.addItem({ command, category, args: { isPalette: true } });
    });
    // Add a console creator to the File menu
    mainMenu.fileMenu.newMenu.addGroup([{ command: CommandIDs.create }], 0);
    // Add a close and shutdown command to the file menu.
    mainMenu.fileMenu.closeAndCleaners.add({
        tracker,
        action: 'Shutdown',
        name: 'Console',
        closeAndCleanup: (current) => {
            return apputils_1.showDialog({
                title: 'Shutdown the console?',
                body: `Are you sure you want to close "${current.title.label}"?`,
                buttons: [apputils_1.Dialog.cancelButton(), apputils_1.Dialog.warnButton()]
            }).then(result => {
                if (result.button.accept) {
                    current.console.session.shutdown().then(() => {
                        current.dispose();
                    });
                }
                else {
                    return void 0;
                }
            });
        }
    });
    // Add a kernel user to the Kernel menu
    mainMenu.kernelMenu.kernelUsers.add({
        tracker,
        interruptKernel: current => {
            let kernel = current.console.session.kernel;
            if (kernel) {
                return kernel.interrupt();
            }
            return Promise.resolve(void 0);
        },
        noun: 'Console',
        restartKernel: current => current.console.session.restart(),
        restartKernelAndClear: current => {
            return current.console.session.restart().then(restarted => {
                if (restarted) {
                    current.console.clear();
                }
                return restarted;
            });
        },
        changeKernel: current => current.console.session.selectKernel(),
        shutdownKernel: current => current.console.session.shutdown()
    });
    // Add a code runner to the Run menu.
    mainMenu.runMenu.codeRunners.add({
        tracker,
        noun: 'Cell',
        pluralNoun: 'Cells',
        run: current => current.console.execute(true)
    });
    // Add a clearer to the edit menu
    mainMenu.editMenu.clearers.add({
        tracker,
        noun: 'Console Cells',
        clearCurrent: (current) => {
            return current.console.clear();
        }
    });
    // Add the execute keystroke setting submenu.
    const executeMenu = new widgets_1.Menu({ commands });
    executeMenu.title.label = 'Console Run Keystroke';
    executeMenu.addItem({ command: CommandIDs.enterToExecute });
    executeMenu.addItem({ command: CommandIDs.shiftEnterToExecute });
    mainMenu.settingsMenu.addGroup([
        {
            type: 'submenu',
            submenu: executeMenu
        }
    ], 10);
    // Add kernel information to the application help menu.
    mainMenu.helpMenu.kernelUsers.add({
        tracker,
        getKernel: current => current.session.kernel
    });
    app.contextMenu.addItem({
        command: CommandIDs.clear,
        selector: '.jp-CodeConsole-content'
    });
    app.contextMenu.addItem({
        command: CommandIDs.restart,
        selector: '.jp-CodeConsole'
    });
    app.contextMenu.addItem({
        command: CommandIDs.toggleShowAllActivity,
        selector: '.jp-CodeConsole'
    });
    return tracker;
}
