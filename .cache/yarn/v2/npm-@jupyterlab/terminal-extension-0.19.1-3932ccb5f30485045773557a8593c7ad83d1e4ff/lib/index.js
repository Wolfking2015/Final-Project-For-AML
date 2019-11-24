"use strict";
// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
Object.defineProperty(exports, "__esModule", { value: true });
const application_1 = require("@jupyterlab/application");
const apputils_1 = require("@jupyterlab/apputils");
const launcher_1 = require("@jupyterlab/launcher");
const mainmenu_1 = require("@jupyterlab/mainmenu");
const terminal_1 = require("@jupyterlab/terminal");
/**
 * The command IDs used by the terminal plugin.
 */
var CommandIDs;
(function (CommandIDs) {
    CommandIDs.createNew = 'terminal:create-new';
    CommandIDs.open = 'terminal:open';
    CommandIDs.refresh = 'terminal:refresh';
    CommandIDs.increaseFont = 'terminal:increase-font';
    CommandIDs.decreaseFont = 'terminal:decrease-font';
    CommandIDs.toggleTheme = 'terminal:toggle-theme';
})(CommandIDs || (CommandIDs = {}));
/**
 * The class name for the terminal icon in the default theme.
 */
const TERMINAL_ICON_CLASS = 'jp-TerminalIcon';
/**
 * The default terminal extension.
 */
const plugin = {
    activate,
    id: '@jupyterlab/terminal-extension:plugin',
    provides: terminal_1.ITerminalTracker,
    requires: [mainmenu_1.IMainMenu, apputils_1.ICommandPalette, application_1.ILayoutRestorer],
    optional: [launcher_1.ILauncher],
    autoStart: true
};
/**
 * Export the plugin as default.
 */
exports.default = plugin;
/**
 * Activate the terminal plugin.
 */
function activate(app, mainMenu, palette, restorer, launcher) {
    const { serviceManager } = app;
    const category = 'Terminal';
    const namespace = 'terminal';
    const tracker = new apputils_1.InstanceTracker({ namespace });
    // Bail if there are no terminals available.
    if (!serviceManager.terminals.isAvailable()) {
        console.log('Disabling terminals plugin because they are not available on the server');
        return tracker;
    }
    // Handle state restoration.
    restorer.restore(tracker, {
        command: CommandIDs.createNew,
        args: widget => ({ name: widget.content.session.name }),
        name: widget => widget.content.session && widget.content.session.name
    });
    addCommands(app, serviceManager, tracker);
    // Add some commands to the application view menu.
    const viewGroup = [
        CommandIDs.increaseFont,
        CommandIDs.decreaseFont,
        CommandIDs.toggleTheme
    ].map(command => {
        return { command };
    });
    mainMenu.viewMenu.addGroup(viewGroup, 30);
    // Add command palette items.
    [
        CommandIDs.createNew,
        CommandIDs.refresh,
        CommandIDs.increaseFont,
        CommandIDs.decreaseFont,
        CommandIDs.toggleTheme
    ].forEach(command => {
        palette.addItem({ command, category, args: { isPalette: true } });
    });
    // Add terminal creation to the file menu.
    mainMenu.fileMenu.newMenu.addGroup([{ command: CommandIDs.createNew }], 20);
    // Add a launcher item if the launcher is available.
    if (launcher) {
        launcher.add({
            command: CommandIDs.createNew,
            category: 'Other',
            rank: 0
        });
    }
    app.contextMenu.addItem({
        command: CommandIDs.refresh,
        selector: '.jp-Terminal',
        rank: 1
    });
    return tracker;
}
/**
 * Add the commands for the terminal.
 */
function addCommands(app, services, tracker) {
    let { commands, shell } = app;
    /**
     * Whether there is an active terminal.
     */
    function isEnabled() {
        return (tracker.currentWidget !== null &&
            tracker.currentWidget === app.shell.currentWidget);
    }
    // Add terminal commands.
    commands.addCommand(CommandIDs.createNew, {
        label: args => (args['isPalette'] ? 'New Terminal' : 'Terminal'),
        caption: 'Start a new terminal session',
        iconClass: args => (args['isPalette'] ? '' : TERMINAL_ICON_CLASS),
        execute: args => {
            const name = args['name'];
            const initialCommand = args['initialCommand'];
            const term = new terminal_1.Terminal({ initialCommand });
            const promise = name
                ? services.terminals.connectTo(name)
                : services.terminals.startNew();
            term.title.icon = TERMINAL_ICON_CLASS;
            term.title.label = '...';
            let main = new apputils_1.MainAreaWidget({ content: term });
            shell.addToMainArea(main);
            return promise
                .then(session => {
                term.session = session;
                tracker.add(main);
                shell.activateById(main.id);
                return main;
            })
                .catch(() => {
                term.dispose();
            });
        }
    });
    commands.addCommand(CommandIDs.open, {
        execute: args => {
            const name = args['name'];
            // Check for a running terminal with the given name.
            const widget = tracker.find(value => {
                let content = value.content;
                return (content.session && content.session.name === name) || false;
            });
            if (widget) {
                shell.activateById(widget.id);
            }
            else {
                // Otherwise, create a new terminal with a given name.
                return commands.execute(CommandIDs.createNew, { name });
            }
        }
    });
    commands.addCommand(CommandIDs.refresh, {
        label: 'Refresh Terminal',
        caption: 'Refresh the current terminal session',
        execute: () => {
            let current = tracker.currentWidget;
            if (!current) {
                return;
            }
            shell.activateById(current.id);
            return current.content.refresh().then(() => {
                if (current) {
                    current.content.activate();
                }
            });
        },
        isEnabled: () => tracker.currentWidget !== null
    });
    commands.addCommand(CommandIDs.increaseFont, {
        label: 'Increase Terminal Font Size',
        execute: () => {
            let options = terminal_1.Terminal.defaultOptions;
            if (options.fontSize < 72) {
                options.fontSize++;
                tracker.forEach(widget => {
                    widget.content.fontSize = options.fontSize;
                });
            }
        },
        isEnabled
    });
    commands.addCommand(CommandIDs.decreaseFont, {
        label: 'Decrease Terminal Font Size',
        execute: () => {
            let options = terminal_1.Terminal.defaultOptions;
            if (options.fontSize > 9) {
                options.fontSize--;
                tracker.forEach(widget => {
                    widget.content.fontSize = options.fontSize;
                });
            }
        },
        isEnabled
    });
    let terminalTheme = 'dark';
    commands.addCommand(CommandIDs.toggleTheme, {
        label: 'Use Dark Terminal Theme',
        caption: 'Whether to use the dark terminal theme',
        isToggled: () => terminalTheme === 'dark',
        execute: () => {
            terminalTheme = terminalTheme === 'dark' ? 'light' : 'dark';
            let options = terminal_1.Terminal.defaultOptions;
            options.theme = terminalTheme;
            tracker.forEach(widget => {
                if (widget.content.theme !== terminalTheme) {
                    widget.content.theme = terminalTheme;
                }
            });
            commands.notifyCommandChanged(CommandIDs.toggleTheme);
        },
        isEnabled
    });
}
exports.addCommands = addCommands;
