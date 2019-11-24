"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const apputils_1 = require("@jupyterlab/apputils");
const apputils_2 = require("@jupyterlab/apputils");
const terminal_1 = require("@jupyterlab/terminal");
const git_1 = require("./git");
/**
 * The command IDs used by the git plugin.
 */
var CommandIDs;
(function (CommandIDs) {
    CommandIDs.gitUI = 'git:ui';
    CommandIDs.gitTerminal = 'git:create-new-terminal';
    CommandIDs.gitTerminalCommand = 'git:terminal-command';
    CommandIDs.gitInit = 'git:init';
    CommandIDs.setupRemotes = 'git:tutorial-remotes';
    CommandIDs.googleLink = 'git:google-link';
})(CommandIDs = exports.CommandIDs || (exports.CommandIDs = {}));
/**
 * Add the commands for the git extension.
 */
function addCommands(app, services) {
    let { commands } = app;
    const namespace = 'terminal';
    const tracker = new apputils_2.InstanceTracker({ namespace });
    let gitApi = new git_1.Git();
    /**
     * Get the current path of the working directory.
     */
    function findCurrentFileBrowserPath() {
        try {
            let leftSidebarItems = app.shell.widgets('left');
            let fileBrowser = leftSidebarItems.next();
            while (fileBrowser.id !== 'filebrowser') {
                fileBrowser = leftSidebarItems.next();
            }
            return fileBrowser.model.path;
        }
        catch (err) { }
    }
    /** Add open terminal command */
    commands.addCommand(CommandIDs.gitTerminal, {
        label: 'Open Terminal',
        caption: 'Start a new terminal session to directly use git command',
        execute: args => {
            let currentFileBrowserPath = findCurrentFileBrowserPath();
            let name = args ? args['name'] : '';
            let terminal = new terminal_1.Terminal();
            terminal.title.closable = true;
            terminal.title.label = '...';
            app.shell.addToMainArea(terminal);
            let promise = name
                ? services.terminals.connectTo(name)
                : services.terminals.startNew();
            return promise
                .then(session => {
                terminal.session = session;
                tracker.add(terminal);
                app.shell.activateById(terminal.id);
                terminal.session.send({
                    type: 'stdin',
                    content: [
                        'cd "' + currentFileBrowserPath.split('"').join('\\"') + '"\n'
                    ]
                });
                return terminal;
            })
                .catch(() => {
                terminal.dispose();
            });
        }
    });
    /** Add open terminal and run command */
    commands.addCommand(CommandIDs.gitTerminalCommand, {
        label: 'Terminal Command',
        caption: 'Open a new terminal session and perform git command',
        execute: args => {
            let currentFileBrowserPath = findCurrentFileBrowserPath();
            let changeDirectoryCommand = currentFileBrowserPath === ' '
                ? ''
                : 'cd "' + currentFileBrowserPath.split('"').join('\\"') + '"';
            let gitCommand = args ? args['cmd'] : '';
            let linkCommand = changeDirectoryCommand !== '' && gitCommand !== '' ? '&&' : '';
            let terminal = new terminal_1.Terminal();
            terminal.title.closable = true;
            terminal.title.label = '...';
            app.shell.addToMainArea(terminal);
            let promise = services.terminals.startNew();
            return promise
                .then(session => {
                terminal.session = session;
                tracker.add(terminal);
                app.shell.activateById(terminal.id);
                terminal.session.send({
                    type: 'stdin',
                    content: [changeDirectoryCommand + linkCommand + gitCommand + '\n']
                });
                return terminal;
            })
                .catch(() => {
                terminal.dispose();
            });
        }
    });
    /** Add open/go to git interface command */
    commands.addCommand(CommandIDs.gitUI, {
        label: 'Git Interface',
        caption: 'Go to Git user interface',
        execute: () => {
            try {
                app.shell.activateById('jp-git-sessions');
            }
            catch (err) { }
        }
    });
    /** Add git init command */
    commands.addCommand(CommandIDs.gitInit, {
        label: 'Init',
        caption: ' Create an empty Git repository or reinitialize an existing one',
        execute: () => {
            let currentFileBrowserPath = findCurrentFileBrowserPath();
            apputils_1.showDialog({
                title: 'Initialize a Repository',
                body: 'Do you really want to make this directory a Git Repo?',
                buttons: [apputils_1.Dialog.cancelButton(), apputils_1.Dialog.warnButton({ label: 'Yes' })]
            }).then(result => {
                if (result.button.accept) {
                    gitApi.init(currentFileBrowserPath);
                }
            });
        }
    });
    /** Add remote tutorial command */
    commands.addCommand(CommandIDs.setupRemotes, {
        label: 'Set Up Remotes',
        caption: 'Learn about Remotes',
        execute: () => {
            window.open('https://www.atlassian.com/git/tutorials/setting-up-a-repository');
        }
    });
    /** Add remote tutorial command */
    commands.addCommand(CommandIDs.googleLink, {
        label: 'Something Else',
        caption: 'Dummy Link ',
        execute: () => {
            window.open('https://www.google.com');
        }
    });
}
exports.addCommands = addCommands;
