"use strict";
// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
Object.defineProperty(exports, "__esModule", { value: true });
const algorithm_1 = require("@phosphor/algorithm");
const widgets_1 = require("@phosphor/widgets");
const apputils_1 = require("@jupyterlab/apputils");
const coreutils_1 = require("@jupyterlab/coreutils");
const mainmenu_1 = require("@jupyterlab/mainmenu");
const services_1 = require("@jupyterlab/services");
/**
 * A namespace for command IDs of semantic extension points.
 */
var CommandIDs;
(function (CommandIDs) {
    CommandIDs.activatePreviouslyUsedTab = 'tabmenu:activate-previously-used-tab';
    CommandIDs.undo = 'editmenu:undo';
    CommandIDs.redo = 'editmenu:redo';
    CommandIDs.clearCurrent = 'editmenu:clear-current';
    CommandIDs.clearAll = 'editmenu:clear-all';
    CommandIDs.find = 'editmenu:find';
    CommandIDs.findAndReplace = 'editmenu:find-and-replace';
    CommandIDs.goToLine = 'editmenu:go-to-line';
    CommandIDs.closeAndCleanup = 'filemenu:close-and-cleanup';
    CommandIDs.persistAndSave = 'filemenu:persist-and-save';
    CommandIDs.createConsole = 'filemenu:create-console';
    CommandIDs.quit = 'filemenu:quit';
    CommandIDs.interruptKernel = 'kernelmenu:interrupt';
    CommandIDs.restartKernel = 'kernelmenu:restart';
    CommandIDs.restartKernelAndClear = 'kernelmenu:restart-and-clear';
    CommandIDs.changeKernel = 'kernelmenu:change';
    CommandIDs.shutdownKernel = 'kernelmenu:shutdown';
    CommandIDs.shutdownAllKernels = 'kernelmenu:shutdownAll';
    CommandIDs.wordWrap = 'viewmenu:word-wrap';
    CommandIDs.lineNumbering = 'viewmenu:line-numbering';
    CommandIDs.matchBrackets = 'viewmenu:match-brackets';
    CommandIDs.run = 'runmenu:run';
    CommandIDs.runAll = 'runmenu:run-all';
    CommandIDs.restartAndRunAll = 'runmenu:restart-and-run-all';
    CommandIDs.runAbove = 'runmenu:run-above';
    CommandIDs.runBelow = 'runmenu:run-below';
})(CommandIDs = exports.CommandIDs || (exports.CommandIDs = {}));
/**
 * A service providing an interface to the main menu.
 */
const menuPlugin = {
    id: '@jupyterlab/mainmenu-extension:plugin',
    requires: [apputils_1.ICommandPalette],
    provides: mainmenu_1.IMainMenu,
    activate: (app, palette) => {
        let menu = new mainmenu_1.MainMenu(app.commands);
        menu.id = 'jp-MainMenu';
        let logo = new widgets_1.Widget();
        logo.addClass('jp-MainAreaPortraitIcon');
        logo.addClass('jp-JupyterIcon');
        logo.id = 'jp-MainLogo';
        let quitButton = coreutils_1.PageConfig.getOption('quit_button');
        menu.fileMenu.quitEntry = quitButton === 'True';
        // Create the application menus.
        createEditMenu(app, menu.editMenu);
        createFileMenu(app, menu.fileMenu);
        createKernelMenu(app, menu.kernelMenu);
        createRunMenu(app, menu.runMenu);
        createSettingsMenu(app, menu.settingsMenu);
        createViewMenu(app, menu.viewMenu);
        createTabsMenu(app, menu.tabsMenu);
        if (menu.fileMenu.quitEntry) {
            palette.addItem({
                command: CommandIDs.quit,
                category: 'Main Area'
            });
        }
        palette.addItem({
            command: CommandIDs.shutdownAllKernels,
            category: 'Kernel Operations'
        });
        palette.addItem({
            command: CommandIDs.activatePreviouslyUsedTab,
            category: 'Main Area'
        });
        app.shell.addToTopArea(logo);
        app.shell.addToTopArea(menu);
        return menu;
    }
};
/**
 * Create the basic `Edit` menu.
 */
function createEditMenu(app, menu) {
    const commands = menu.menu.commands;
    // Add the undo/redo commands the the Edit menu.
    commands.addCommand(CommandIDs.undo, {
        label: 'Undo',
        isEnabled: Private.delegateEnabled(app, menu.undoers, 'undo'),
        execute: Private.delegateExecute(app, menu.undoers, 'undo')
    });
    commands.addCommand(CommandIDs.redo, {
        label: 'Redo',
        isEnabled: Private.delegateEnabled(app, menu.undoers, 'redo'),
        execute: Private.delegateExecute(app, menu.undoers, 'redo')
    });
    menu.addGroup([{ command: CommandIDs.undo }, { command: CommandIDs.redo }], 0);
    // Add the clear commands to the Edit menu.
    commands.addCommand(CommandIDs.clearCurrent, {
        label: () => {
            const noun = Private.delegateLabel(app, menu.clearers, 'noun');
            const enabled = Private.delegateEnabled(app, menu.clearers, 'clearCurrent')();
            return `Clear${enabled ? ` ${noun}` : ''}`;
        },
        isEnabled: Private.delegateEnabled(app, menu.clearers, 'clearCurrent'),
        execute: Private.delegateExecute(app, menu.clearers, 'clearCurrent')
    });
    commands.addCommand(CommandIDs.clearAll, {
        label: () => {
            const noun = Private.delegateLabel(app, menu.clearers, 'pluralNoun');
            const enabled = Private.delegateEnabled(app, menu.clearers, 'clearAll')();
            return `Clear All${enabled ? ` ${noun}` : ''}`;
        },
        isEnabled: Private.delegateEnabled(app, menu.clearers, 'clearAll'),
        execute: Private.delegateExecute(app, menu.clearers, 'clearAll')
    });
    menu.addGroup([{ command: CommandIDs.clearCurrent }, { command: CommandIDs.clearAll }], 10);
    // Add the find/replace commands the the Edit menu.
    commands.addCommand(CommandIDs.find, {
        label: 'Find…',
        isEnabled: Private.delegateEnabled(app, menu.findReplacers, 'find'),
        execute: Private.delegateExecute(app, menu.findReplacers, 'find')
    });
    commands.addCommand(CommandIDs.findAndReplace, {
        label: 'Find and Replace…',
        isEnabled: Private.delegateEnabled(app, menu.findReplacers, 'findAndReplace'),
        execute: Private.delegateExecute(app, menu.findReplacers, 'findAndReplace')
    });
    menu.addGroup([{ command: CommandIDs.find }, { command: CommandIDs.findAndReplace }], 200);
    commands.addCommand(CommandIDs.goToLine, {
        label: 'Go to Line…',
        isEnabled: Private.delegateEnabled(app, menu.goToLiners, 'goToLine'),
        execute: Private.delegateExecute(app, menu.goToLiners, 'goToLine')
    });
    menu.addGroup([{ command: CommandIDs.goToLine }], 200);
}
exports.createEditMenu = createEditMenu;
/**
 * Create the basic `File` menu.
 */
function createFileMenu(app, menu) {
    const commands = menu.menu.commands;
    // Add a delegator command for closing and cleaning up an activity.
    commands.addCommand(CommandIDs.closeAndCleanup, {
        label: () => {
            const action = Private.delegateLabel(app, menu.closeAndCleaners, 'action');
            const name = Private.delegateLabel(app, menu.closeAndCleaners, 'name');
            return `Close and ${action ? ` ${action} ${name}` : 'Shutdown'}`;
        },
        isEnabled: Private.delegateEnabled(app, menu.closeAndCleaners, 'closeAndCleanup'),
        execute: Private.delegateExecute(app, menu.closeAndCleaners, 'closeAndCleanup')
    });
    // Add a delegator command for persisting data then saving.
    commands.addCommand(CommandIDs.persistAndSave, {
        label: () => {
            const action = Private.delegateLabel(app, menu.persistAndSavers, 'action');
            const name = Private.delegateLabel(app, menu.persistAndSavers, 'name');
            return `Save ${name} ${action || 'with Extras'}`;
        },
        isEnabled: args => {
            return (Private.delegateEnabled(app, menu.persistAndSavers, 'persistAndSave')() && commands.isEnabled('docmanager:save', args));
        },
        execute: Private.delegateExecute(app, menu.persistAndSavers, 'persistAndSave')
    });
    // Add a delegator command for creating a console for an activity.
    commands.addCommand(CommandIDs.createConsole, {
        label: () => {
            const name = Private.delegateLabel(app, menu.consoleCreators, 'name');
            const label = `New Console for ${name ? name : 'Activity'}`;
            return label;
        },
        isEnabled: Private.delegateEnabled(app, menu.consoleCreators, 'createConsole'),
        execute: Private.delegateExecute(app, menu.consoleCreators, 'createConsole')
    });
    commands.addCommand(CommandIDs.quit, {
        label: 'Quit',
        caption: 'Quit JupyterLab',
        execute: () => {
            apputils_1.showDialog({
                title: 'Quit confirmation',
                body: 'Please confirm you want to quit JupyterLab.',
                buttons: [apputils_1.Dialog.cancelButton(), apputils_1.Dialog.warnButton({ label: 'Quit' })]
            }).then(result => {
                if (result.button.accept) {
                    let setting = services_1.ServerConnection.makeSettings();
                    let apiURL = coreutils_1.URLExt.join(setting.baseUrl, 'api/shutdown');
                    services_1.ServerConnection.makeRequest(apiURL, { method: 'POST' }, setting)
                        .then(result => {
                        if (result.ok) {
                            // Close this window if the shutdown request has been successful
                            let body = document.createElement('div');
                            body.innerHTML = `<p>You have shut down the Jupyter server. You can now close this tab.</p>
                  <p>To use JupyterLab again, you will need to relaunch it.</p>`;
                            apputils_1.showDialog({
                                title: 'Server stopped',
                                body: new widgets_1.Widget({ node: body }),
                                buttons: []
                            });
                            window.close();
                        }
                        else {
                            throw new services_1.ServerConnection.ResponseError(result);
                        }
                    })
                        .catch(data => {
                        throw new services_1.ServerConnection.NetworkError(data);
                    });
                }
            });
        }
    });
    // Add the new group
    const newGroup = [
        { type: 'submenu', submenu: menu.newMenu.menu },
        { command: 'filebrowser:create-main-launcher' }
    ];
    const newViewGroup = [
        { command: 'docmanager:clone' },
        { command: CommandIDs.createConsole },
        { command: 'docmanager:open-direct' }
    ];
    // Add the close group
    const closeGroup = [
        'docmanager:close',
        'filemenu:close-and-cleanup',
        'docmanager:close-all-files'
    ].map(command => {
        return { command };
    });
    // Add save group.
    const saveGroup = [
        'docmanager:save',
        'filemenu:persist-and-save',
        'docmanager:save-as',
        'docmanager:save-all'
    ].map(command => {
        return { command };
    });
    // Add the re group.
    const reGroup = [
        'docmanager:reload',
        'docmanager:restore-checkpoint',
        'docmanager:rename'
    ].map(command => {
        return { command };
    });
    // Add the quit group.
    const quitGroup = [{ command: 'filemenu:quit' }];
    menu.addGroup(newGroup, 0);
    menu.addGroup(newViewGroup, 1);
    menu.addGroup(closeGroup, 2);
    menu.addGroup(saveGroup, 3);
    menu.addGroup(reGroup, 4);
    if (menu.quitEntry) {
        menu.addGroup(quitGroup, 99);
    }
}
exports.createFileMenu = createFileMenu;
/**
 * Create the basic `Kernel` menu.
 */
function createKernelMenu(app, menu) {
    const commands = menu.menu.commands;
    commands.addCommand(CommandIDs.interruptKernel, {
        label: 'Interrupt Kernel',
        isEnabled: Private.delegateEnabled(app, menu.kernelUsers, 'interruptKernel'),
        execute: Private.delegateExecute(app, menu.kernelUsers, 'interruptKernel')
    });
    commands.addCommand(CommandIDs.restartKernel, {
        label: 'Restart Kernel…',
        isEnabled: Private.delegateEnabled(app, menu.kernelUsers, 'restartKernel'),
        execute: Private.delegateExecute(app, menu.kernelUsers, 'restartKernel')
    });
    commands.addCommand(CommandIDs.restartKernelAndClear, {
        label: () => {
            const noun = Private.delegateLabel(app, menu.kernelUsers, 'noun');
            const enabled = Private.delegateEnabled(app, menu.kernelUsers, 'restartKernelAndClear')();
            return `Restart Kernel and Clear${enabled ? ` ${noun}` : ''}…`;
        },
        isEnabled: Private.delegateEnabled(app, menu.kernelUsers, 'restartKernelAndClear'),
        execute: Private.delegateExecute(app, menu.kernelUsers, 'restartKernelAndClear')
    });
    commands.addCommand(CommandIDs.changeKernel, {
        label: 'Change Kernel…',
        isEnabled: Private.delegateEnabled(app, menu.kernelUsers, 'changeKernel'),
        execute: Private.delegateExecute(app, menu.kernelUsers, 'changeKernel')
    });
    commands.addCommand(CommandIDs.shutdownKernel, {
        label: 'Shutdown Kernel',
        isEnabled: Private.delegateEnabled(app, menu.kernelUsers, 'shutdownKernel'),
        execute: Private.delegateExecute(app, menu.kernelUsers, 'shutdownKernel')
    });
    commands.addCommand(CommandIDs.shutdownAllKernels, {
        label: 'Shutdown All Kernels…',
        isEnabled: () => {
            return app.serviceManager.sessions.running().next() !== undefined;
        },
        execute: () => {
            apputils_1.showDialog({
                title: 'Shutdown All?',
                body: 'Shut down all kernels?',
                buttons: [
                    apputils_1.Dialog.cancelButton(),
                    apputils_1.Dialog.warnButton({ label: 'SHUTDOWN' })
                ]
            }).then(result => {
                if (result.button.accept) {
                    return app.serviceManager.sessions.shutdownAll();
                }
            });
        }
    });
    const restartGroup = [
        CommandIDs.restartKernel,
        CommandIDs.restartKernelAndClear,
        CommandIDs.restartAndRunAll
    ].map(command => {
        return { command };
    });
    menu.addGroup([{ command: CommandIDs.interruptKernel }], 0);
    menu.addGroup(restartGroup, 1);
    menu.addGroup([
        { command: CommandIDs.shutdownKernel },
        { command: CommandIDs.shutdownAllKernels }
    ], 2);
    menu.addGroup([{ command: CommandIDs.changeKernel }], 3);
}
exports.createKernelMenu = createKernelMenu;
/**
 * Create the basic `View` menu.
 */
function createViewMenu(app, menu) {
    const commands = menu.menu.commands;
    commands.addCommand(CommandIDs.lineNumbering, {
        label: 'Show Line Numbers',
        isEnabled: Private.delegateEnabled(app, menu.editorViewers, 'toggleLineNumbers'),
        isToggled: Private.delegateToggled(app, menu.editorViewers, 'lineNumbersToggled'),
        execute: Private.delegateExecute(app, menu.editorViewers, 'toggleLineNumbers')
    });
    commands.addCommand(CommandIDs.matchBrackets, {
        label: 'Match Brackets',
        isEnabled: Private.delegateEnabled(app, menu.editorViewers, 'toggleMatchBrackets'),
        isToggled: Private.delegateToggled(app, menu.editorViewers, 'matchBracketsToggled'),
        execute: Private.delegateExecute(app, menu.editorViewers, 'toggleMatchBrackets')
    });
    commands.addCommand(CommandIDs.wordWrap, {
        label: 'Wrap Words',
        isEnabled: Private.delegateEnabled(app, menu.editorViewers, 'toggleWordWrap'),
        isToggled: Private.delegateToggled(app, menu.editorViewers, 'wordWrapToggled'),
        execute: Private.delegateExecute(app, menu.editorViewers, 'toggleWordWrap')
    });
    menu.addGroup([
        { command: 'application:toggle-left-area' },
        { command: 'application:toggle-right-area' }
    ], 0);
    const editorViewerGroup = [
        CommandIDs.lineNumbering,
        CommandIDs.matchBrackets,
        CommandIDs.wordWrap
    ].map(command => {
        return { command };
    });
    menu.addGroup(editorViewerGroup, 10);
    // Add the command for toggling single-document mode.
    menu.addGroup([
        { command: 'application:toggle-presentation-mode' },
        { command: 'application:toggle-mode' }
    ], 1000);
}
exports.createViewMenu = createViewMenu;
function createRunMenu(app, menu) {
    const commands = menu.menu.commands;
    commands.addCommand(CommandIDs.run, {
        label: () => {
            const noun = Private.delegateLabel(app, menu.codeRunners, 'noun');
            const enabled = Private.delegateEnabled(app, menu.codeRunners, 'run')();
            return `Run Selected${enabled ? ` ${noun}` : ''}`;
        },
        isEnabled: Private.delegateEnabled(app, menu.codeRunners, 'run'),
        execute: Private.delegateExecute(app, menu.codeRunners, 'run')
    });
    commands.addCommand(CommandIDs.runAll, {
        label: () => {
            const noun = Private.delegateLabel(app, menu.codeRunners, 'noun');
            const enabled = Private.delegateEnabled(app, menu.codeRunners, 'runAll')();
            return `Run All${enabled ? ` ${noun}` : ''}`;
        },
        isEnabled: Private.delegateEnabled(app, menu.codeRunners, 'runAll'),
        execute: Private.delegateExecute(app, menu.codeRunners, 'runAll')
    });
    commands.addCommand(CommandIDs.restartAndRunAll, {
        label: () => {
            const noun = Private.delegateLabel(app, menu.codeRunners, 'noun');
            const enabled = Private.delegateEnabled(app, menu.codeRunners, 'restartAndRunAll')();
            return `Restart Kernel and Run All${enabled ? ` ${noun}` : ''}…`;
        },
        isEnabled: Private.delegateEnabled(app, menu.codeRunners, 'restartAndRunAll'),
        execute: Private.delegateExecute(app, menu.codeRunners, 'restartAndRunAll')
    });
    const runAllGroup = [CommandIDs.runAll, CommandIDs.restartAndRunAll].map(command => {
        return { command };
    });
    menu.addGroup([{ command: CommandIDs.run }], 0);
    menu.addGroup(runAllGroup, 999);
}
exports.createRunMenu = createRunMenu;
function createSettingsMenu(app, menu) {
    menu.addGroup([{ command: 'settingeditor:open' }], 1000);
}
exports.createSettingsMenu = createSettingsMenu;
function createTabsMenu(app, menu) {
    const commands = app.commands;
    // Add commands for cycling the active tabs.
    menu.addGroup([
        { command: 'application:activate-next-tab' },
        { command: 'application:activate-previous-tab' },
        { command: CommandIDs.activatePreviouslyUsedTab }
    ], 0);
    // A list of the active tabs in the main area.
    const tabGroup = [];
    // A disposable for getting rid of the out-of-date tabs list.
    let disposable;
    // Utility function to create a command to activate
    // a given tab, or get it if it already exists.
    const createMenuItem = (widget) => {
        const commandID = `tabmenu:activate-${widget.id}`;
        if (!commands.hasCommand(commandID)) {
            commands.addCommand(commandID, {
                label: () => widget.title.label,
                isVisible: () => !widget.isDisposed,
                isEnabled: () => !widget.isDisposed,
                isToggled: () => app.shell.currentWidget === widget,
                execute: () => app.shell.activateById(widget.id)
            });
        }
        return { command: commandID };
    };
    let previousId = '';
    // Command to toggle between the current
    // tab and the last modified tab.
    commands.addCommand(CommandIDs.activatePreviouslyUsedTab, {
        label: 'Activate Previously Used Tab',
        isEnabled: () => !!previousId,
        execute: () => previousId && app.commands.execute(`tabmenu:activate-${previousId}`)
    });
    app.restored.then(() => {
        // Iterate over the current widgets in the
        // main area, and add them to the tab group
        // of the menu.
        const populateTabs = () => {
            // remove the previous tab list
            if (disposable && !disposable.isDisposed) {
                disposable.dispose();
            }
            tabGroup.length = 0;
            let isPreviouslyUsedTabAttached = false;
            algorithm_1.each(app.shell.widgets('main'), widget => {
                if (widget.id === previousId) {
                    isPreviouslyUsedTabAttached = true;
                }
                tabGroup.push(createMenuItem(widget));
            });
            disposable = menu.addGroup(tabGroup, 1);
            previousId = isPreviouslyUsedTabAttached ? previousId : '';
        };
        populateTabs();
        app.shell.layoutModified.connect(() => {
            populateTabs();
        });
        // Update the id of the previous active tab if
        // a new tab is selected.
        app.shell.currentChanged.connect((sender, args) => {
            let widget = args.oldValue;
            if (!widget) {
                return;
            }
            previousId = widget.id;
        });
    });
}
exports.createTabsMenu = createTabsMenu;
exports.default = menuPlugin;
/**
 * A namespace for Private data.
 */
var Private;
(function (Private) {
    /**
     * Return the first value of the iterable that satisfies the predicate
     * function.
     */
    function find(it, predicate) {
        for (let value of it) {
            if (predicate(value)) {
                return value;
            }
        }
        return undefined;
    }
    /**
     * A utility function that delegates a portion of a label to an IMenuExtender.
     */
    function delegateLabel(app, s, label) {
        let widget = app.shell.currentWidget;
        const extender = find(s, value => value.tracker.has(widget));
        if (!extender) {
            return '';
        }
        // Coerce the result to be a string. When Typedoc is updated to use
        // Typescript 2.8, we can possibly use conditional types to get Typescript
        // to recognize this is a string.
        return extender[label];
    }
    Private.delegateLabel = delegateLabel;
    /**
     * A utility function that delegates command execution
     * to an IMenuExtender.
     */
    function delegateExecute(app, s, executor) {
        return () => {
            let widget = app.shell.currentWidget;
            const extender = find(s, value => value.tracker.has(widget));
            if (!extender) {
                return Promise.resolve(void 0);
            }
            // Coerce the result to be a function. When Typedoc is updated to use
            // Typescript 2.8, we can possibly use conditional types to get Typescript
            // to recognize this is a function.
            let f = extender[executor];
            return f(widget);
        };
    }
    Private.delegateExecute = delegateExecute;
    /**
     * A utility function that delegates whether a command is enabled
     * to an IMenuExtender.
     */
    function delegateEnabled(app, s, executor) {
        return () => {
            let widget = app.shell.currentWidget;
            const extender = find(s, value => value.tracker.has(widget));
            return (!!extender &&
                !!extender[executor] &&
                (extender.isEnabled ? extender.isEnabled(widget) : true));
        };
    }
    Private.delegateEnabled = delegateEnabled;
    /**
     * A utility function that delegates whether a command is toggled
     * for an IMenuExtender.
     */
    function delegateToggled(app, s, toggled) {
        return () => {
            let widget = app.shell.currentWidget;
            const extender = find(s, value => value.tracker.has(widget));
            // Coerce extender[toggled] to be a function. When Typedoc is updated to use
            // Typescript 2.8, we can possibly use conditional types to get Typescript
            // to recognize this is a function.
            return (!!extender &&
                !!extender[toggled] &&
                !!extender[toggled](widget));
        };
    }
    Private.delegateToggled = delegateToggled;
})(Private || (Private = {}));
