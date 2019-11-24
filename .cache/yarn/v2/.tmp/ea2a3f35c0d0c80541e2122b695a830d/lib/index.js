"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const gitMenuCommands_1 = require("./gitMenuCommands");
const coreutils_1 = require("@jupyterlab/coreutils");
const GitWidget_1 = require("./components/GitWidget");
const application_1 = require("@jupyterlab/application");
const filebrowser_1 = require("@jupyterlab/filebrowser");
const mainmenu_1 = require("@jupyterlab/mainmenu");
const widgets_1 = require("@phosphor/widgets");
const coreutils_2 = require("@phosphor/coreutils");
const GitWidgetStyle_1 = require("./componentsStyle/GitWidgetStyle");
require("../style/variables.css");
const gitClone_1 = require("./gitClone");
const rendermime_1 = require("@jupyterlab/rendermime");
exports.EXTENSION_ID = 'jupyter.extensions.git_plugin';
// tslint:disable-next-line: variable-name
exports.IGitExtension = new coreutils_2.Token(exports.EXTENSION_ID);
/**
 * The default running sessions extension.
 */
const plugin = {
    id: 'jupyter.extensions.running-sessions-git',
    requires: [
        mainmenu_1.IMainMenu,
        application_1.ILayoutRestorer,
        filebrowser_1.IFileBrowserFactory,
        rendermime_1.IRenderMimeRegistry
    ],
    provides: exports.IGitExtension,
    activate,
    autoStart: true
};
/**
 * Export the plugin as default.
 */
exports.default = plugin;
/** Main extension class */
class GitExtension {
    constructor(app, restorer, factory) {
        this.diffProviders = {};
        this.app = app;
        this.gitPlugin = new GitWidget_1.GitWidget(app, { manager: app.serviceManager }, this.performDiff.bind(this));
        this.gitPlugin.id = 'jp-git-sessions';
        this.gitPlugin.title.iconClass = `jp-SideBar-tabIcon ${GitWidgetStyle_1.gitTabStyle}`;
        this.gitPlugin.title.caption = 'Git';
        // Let the application restorer track the running panel for restoration of
        // application state (e.g. setting the running panel as the current side bar
        // widget).
        restorer.add(this.gitPlugin, 'git-sessions');
        app.shell.addToLeftArea(this.gitPlugin, { rank: 200 });
        this.gitCloneWidget = new gitClone_1.GitClone(factory);
    }
    registerDiffProvider(filetypes, callback) {
        filetypes.forEach(fileType => {
            this.diffProviders[fileType] = callback;
        });
    }
    performDiff(filename, revisionA, revisionB) {
        let extension = coreutils_1.PathExt.extname(filename).toLocaleLowerCase();
        if (this.diffProviders[extension] !== undefined) {
            this.diffProviders[extension](filename, revisionA, revisionB);
        }
        else {
            this.app.commands.execute('git:terminal-cmd', {
                cmd: 'git diff ' + revisionA + ' ' + revisionB
            });
        }
    }
}
exports.GitExtension = GitExtension;
/**
 * Activate the running plugin.
 */
function activate(app, mainMenu, restorer, factory) {
    const { commands } = app;
    let gitExtension = new GitExtension(app, restorer, factory);
    const category = 'Git';
    // Rank has been chosen somewhat arbitrarily to give priority to the running
    // sessions widget in the sidebar.
    gitMenuCommands_1.addCommands(app, app.serviceManager);
    let menu = new widgets_1.Menu({ commands });
    let tutorial = new widgets_1.Menu({ commands });
    tutorial.title.label = ' Tutorial ';
    menu.title.label = category;
    [gitMenuCommands_1.CommandIDs.gitUI, gitMenuCommands_1.CommandIDs.gitTerminal, gitMenuCommands_1.CommandIDs.gitInit].forEach(command => {
        menu.addItem({ command });
    });
    [gitMenuCommands_1.CommandIDs.setupRemotes, gitMenuCommands_1.CommandIDs.googleLink].forEach(command => {
        tutorial.addItem({ command });
    });
    menu.addItem({ type: 'submenu', submenu: tutorial });
    mainMenu.addMenu(menu, { rank: 60 });
    return gitExtension;
}
