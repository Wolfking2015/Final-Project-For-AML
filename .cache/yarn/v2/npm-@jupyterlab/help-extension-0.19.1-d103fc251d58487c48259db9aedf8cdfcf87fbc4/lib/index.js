"use strict";
// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
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
const mainmenu_1 = require("@jupyterlab/mainmenu");
const React = __importStar(require("react"));
require("../style/index.css");
/**
 * The command IDs used by the help plugin.
 */
var CommandIDs;
(function (CommandIDs) {
    CommandIDs.open = 'help:open';
    CommandIDs.about = 'help:about';
    CommandIDs.activate = 'help:activate';
    CommandIDs.close = 'help:close';
    CommandIDs.show = 'help:show';
    CommandIDs.hide = 'help:hide';
    CommandIDs.toggle = 'help:toggle';
    CommandIDs.launchClassic = 'help:launch-classic-notebook';
})(CommandIDs || (CommandIDs = {}));
/**
 * A flag denoting whether the application is loaded over HTTPS.
 */
const LAB_IS_SECURE = window.location.protocol === 'https:';
/**
 * The class name added to the help widget.
 */
const HELP_CLASS = 'jp-Help';
/**
 * A list of help resources.
 */
const RESOURCES = [
    {
        text: 'JupyterLab Reference',
        url: 'https://jupyterlab.readthedocs.io/en/stable/'
    },
    {
        text: 'Notebook Reference',
        url: 'https://jupyter-notebook.readthedocs.io/en/latest/'
    },
    {
        text: 'Markdown Reference',
        url: 'https://help.github.com/articles/' +
            'getting-started-with-writing-and-formatting-on-github/'
    }
];
RESOURCES.sort((a, b) => {
    return a.text.localeCompare(b.text);
});
/**
 * The help handler extension.
 */
const plugin = {
    activate,
    id: '@jupyterlab/help-extension:plugin',
    requires: [mainmenu_1.IMainMenu, apputils_1.ICommandPalette, application_1.ILayoutRestorer],
    autoStart: true
};
/**
 * Export the plugin as default.
 */
exports.default = plugin;
/**
 * Activate the help handler extension.
 *
 * @param app - The phosphide application object.
 *
 * returns A promise that resolves when the extension is activated.
 */
function activate(app, mainMenu, palette, restorer) {
    let counter = 0;
    const category = 'Help';
    const namespace = 'help-doc';
    const baseUrl = coreutils_1.PageConfig.getBaseUrl();
    const { commands, shell, info, serviceManager } = app;
    const tracker = new apputils_1.InstanceTracker({ namespace });
    // Handle state restoration.
    restorer.restore(tracker, {
        command: CommandIDs.open,
        args: widget => ({
            url: widget.content.url,
            text: widget.content.title.label
        }),
        name: widget => widget.content.url
    });
    /**
     * Create a new HelpWidget widget.
     */
    function newHelpWidget(url, text) {
        let content = new apputils_1.IFrame();
        content.url = url;
        content.addClass(HELP_CLASS);
        content.title.label = text;
        content.id = `${namespace}-${++counter}`;
        let widget = new apputils_1.MainAreaWidget({ content });
        widget.addClass('jp-Help');
        return widget;
    }
    // Populate the Help menu.
    const helpMenu = mainMenu.helpMenu;
    const labGroup = [
        CommandIDs.about,
        'faq-jupyterlab:open',
        CommandIDs.launchClassic
    ].map(command => {
        return { command };
    });
    helpMenu.addGroup(labGroup, 0);
    const resourcesGroup = RESOURCES.map(args => ({
        args,
        command: CommandIDs.open
    }));
    helpMenu.addGroup(resourcesGroup, 10);
    // Generate a cache of the kernel help links.
    const kernelInfoCache = new Map();
    serviceManager.sessions.runningChanged.connect((m, sessions) => {
        // If a new session has been added, it is at the back
        // of the session list. If one has changed or stopped,
        // it does not hurt to check it.
        if (!sessions.length) {
            return;
        }
        const sessionModel = sessions[sessions.length - 1];
        if (kernelInfoCache.has(sessionModel.kernel.name)) {
            return;
        }
        const session = serviceManager.sessions.connectTo(sessionModel);
        session.kernel.ready.then(() => {
            // Check the cache second time so that, if two callbacks get scheduled,
            // they don't try to add the same commands.
            if (kernelInfoCache.has(sessionModel.kernel.name)) {
                return;
            }
            // Set the Kernel Info cache.
            const name = session.kernel.name;
            const kernelInfo = session.kernel.info;
            kernelInfoCache.set(name, kernelInfo);
            // Utility function to check if the current widget
            // has registered itself with the help menu.
            const usesKernel = () => {
                let result = false;
                const widget = app.shell.currentWidget;
                if (!widget) {
                    return result;
                }
                helpMenu.kernelUsers.forEach(u => {
                    if (u.tracker.has(widget) &&
                        u.getKernel(widget) &&
                        u.getKernel(widget).name === name) {
                        result = true;
                    }
                });
                return result;
            };
            // Add the kernel banner to the Help Menu.
            const bannerCommand = `help-menu-${name}:banner`;
            const spec = serviceManager.specs.kernelspecs[name];
            const kernelName = spec.display_name;
            let kernelIconUrl = spec.resources['logo-64x64'];
            if (kernelIconUrl) {
                let index = kernelIconUrl.indexOf('kernelspecs');
                kernelIconUrl = baseUrl + kernelIconUrl.slice(index);
            }
            commands.addCommand(bannerCommand, {
                label: `About the ${kernelName} Kernel`,
                isVisible: usesKernel,
                isEnabled: usesKernel,
                execute: () => {
                    // Create the header of the about dialog
                    let headerLogo = React.createElement("img", { src: kernelIconUrl });
                    let title = (React.createElement("span", { className: "jp-About-header" },
                        headerLogo,
                        React.createElement("div", { className: "jp-About-header-info" }, kernelName)));
                    const banner = React.createElement("pre", null, kernelInfo.banner);
                    let body = React.createElement("div", { className: "jp-About-body" }, banner);
                    apputils_1.showDialog({
                        title,
                        body,
                        buttons: [
                            apputils_1.Dialog.createButton({
                                label: 'DISMISS',
                                className: 'jp-About-button jp-mod-reject jp-mod-styled'
                            })
                        ]
                    });
                }
            });
            helpMenu.addGroup([{ command: bannerCommand }], 20);
            // Add the kernel info help_links to the Help menu.
            const kernelGroup = [];
            (session.kernel.info.help_links || []).forEach(link => {
                const commandId = `help-menu-${name}:${link.text}`;
                commands.addCommand(commandId, {
                    label: link.text,
                    isVisible: usesKernel,
                    isEnabled: usesKernel,
                    execute: () => {
                        commands.execute(CommandIDs.open, link);
                    }
                });
                kernelGroup.push({ command: commandId });
            });
            helpMenu.addGroup(kernelGroup, 21);
            // Dispose of the session object since we no longer need it.
            session.dispose();
        });
    });
    commands.addCommand(CommandIDs.about, {
        label: `About ${info.name}`,
        execute: () => {
            // Create the header of the about dialog
            let headerLogo = React.createElement("div", { className: "jp-About-header-logo" });
            let headerWordmark = React.createElement("div", { className: "jp-About-header-wordmark" });
            let versionNumber = `Version ${info.version}`;
            let versionInfo = (React.createElement("span", { className: "jp-About-version-info" },
                React.createElement("span", { className: "jp-About-version" }, versionNumber)));
            let title = (React.createElement("span", { className: "jp-About-header" },
                headerLogo,
                React.createElement("div", { className: "jp-About-header-info" },
                    headerWordmark,
                    versionInfo)));
            // Create the body of the about dialog
            let jupyterURL = 'https://jupyter.org/about.html';
            let contributorsURL = 'https://github.com/jupyterlab/jupyterlab/graphs/contributors';
            let externalLinks = (React.createElement("span", { className: "jp-About-externalLinks" },
                React.createElement("a", { href: contributorsURL, target: "_blank", className: "jp-Button-flat" }, "CONTRIBUTOR LIST"),
                React.createElement("a", { href: jupyterURL, target: "_blank", className: "jp-Button-flat" }, "ABOUT PROJECT JUPYTER")));
            let copyright = (React.createElement("span", { className: "jp-About-copyright" }, "\u00A9 2015 Project Jupyter Contributors"));
            let body = (React.createElement("div", { className: "jp-About-body" },
                externalLinks,
                copyright));
            apputils_1.showDialog({
                title,
                body,
                buttons: [
                    apputils_1.Dialog.createButton({
                        label: 'DISMISS',
                        className: 'jp-About-button jp-mod-reject jp-mod-styled'
                    })
                ]
            });
        }
    });
    commands.addCommand(CommandIDs.open, {
        label: args => args['text'],
        execute: args => {
            const url = args['url'];
            const text = args['text'];
            // If help resource will generate a mixed content error, load externally.
            if (LAB_IS_SECURE && coreutils_1.URLExt.parse(url).protocol !== 'https:') {
                window.open(url);
                return;
            }
            let widget = newHelpWidget(url, text);
            tracker.add(widget);
            shell.addToMainArea(widget);
        }
    });
    commands.addCommand(CommandIDs.launchClassic, {
        label: 'Launch Classic Notebook',
        execute: () => {
            window.open(coreutils_1.PageConfig.getBaseUrl() + 'tree');
        }
    });
    RESOURCES.forEach(args => {
        palette.addItem({ args, command: CommandIDs.open, category });
    });
    palette.addItem({ command: 'apputils:reset', category });
    palette.addItem({ command: CommandIDs.launchClassic, category });
}
