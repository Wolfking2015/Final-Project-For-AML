"use strict";
// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
Object.defineProperty(exports, "__esModule", { value: true });
const apputils_1 = require("@jupyterlab/apputils");
const launcher_1 = require("@jupyterlab/launcher");
const algorithm_1 = require("@phosphor/algorithm");
require("../style/index.css");
/**
 * The command IDs used by the launcher plugin.
 */
var CommandIDs;
(function (CommandIDs) {
    CommandIDs.create = 'launcher:create';
})(CommandIDs || (CommandIDs = {}));
/**
 * A service providing an interface to the the launcher.
 */
const plugin = {
    activate,
    id: '@jupyterlab/launcher-extension:plugin',
    requires: [apputils_1.ICommandPalette],
    provides: launcher_1.ILauncher,
    autoStart: true
};
/**
 * Export the plugin as default.
 */
exports.default = plugin;
/**
 * Activate the launcher.
 */
function activate(app, palette) {
    const { commands, shell } = app;
    const model = new launcher_1.LauncherModel();
    commands.addCommand(CommandIDs.create, {
        label: 'New Launcher',
        execute: (args) => {
            const cwd = args['cwd'] ? String(args['cwd']) : '';
            const id = `launcher-${Private.id++}`;
            const callback = (item) => {
                shell.addToMainArea(item, { ref: id });
            };
            const launcher = new launcher_1.Launcher({ cwd, callback, commands });
            launcher.model = model;
            launcher.title.label = 'Launcher';
            launcher.title.iconClass = 'jp-LauncherIcon';
            let main = new apputils_1.MainAreaWidget({ content: launcher });
            // If there are any other widgets open, remove the launcher close icon.
            main.title.closable = !!algorithm_1.toArray(shell.widgets('main')).length;
            main.id = id;
            shell.addToMainArea(main, { activate: args['activate'] });
            shell.layoutModified.connect(() => {
                // If there is only a launcher open, remove the close icon.
                main.title.closable = algorithm_1.toArray(shell.widgets('main')).length > 1;
            }, main);
            return main;
        }
    });
    palette.addItem({ command: CommandIDs.create, category: 'Launcher' });
    return model;
}
/**
 * The namespace for module private data.
 */
var Private;
(function (Private) {
    /**
     * The incrementing id used for launcher widgets.
     */
    Private.id = 0;
})(Private || (Private = {}));
