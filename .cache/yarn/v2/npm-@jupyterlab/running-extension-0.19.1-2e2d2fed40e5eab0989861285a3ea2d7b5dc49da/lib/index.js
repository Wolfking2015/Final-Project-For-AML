"use strict";
// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
Object.defineProperty(exports, "__esModule", { value: true });
const application_1 = require("@jupyterlab/application");
const running_1 = require("@jupyterlab/running");
/**
 * The default running sessions extension.
 */
const plugin = {
    activate,
    id: '@jupyterlab/running-extension:plugin',
    requires: [application_1.ILayoutRestorer],
    autoStart: true
};
/**
 * Export the plugin as default.
 */
exports.default = plugin;
/**
 * Activate the running plugin.
 */
function activate(app, restorer) {
    let running = new running_1.RunningSessions({ manager: app.serviceManager });
    running.id = 'jp-running-sessions';
    running.title.iconClass = 'jp-DirectionsRunIcon jp-SideBar-tabIcon';
    running.title.caption = 'Running Terminals and Kernels';
    // Let the application restorer track the running panel for restoration of
    // application state (e.g. setting the running panel as the current side bar
    // widget).
    restorer.add(running, 'running-sessions');
    running.sessionOpenRequested.connect((sender, model) => {
        let path = model.path;
        if (model.type.toLowerCase() === 'console') {
            app.commands.execute('console:open', { path });
        }
        else {
            app.commands.execute('docmanager:open', { path });
        }
    });
    running.terminalOpenRequested.connect((sender, model) => {
        app.commands.execute('terminal:open', { name: model.name });
    });
    // Rank has been chosen somewhat arbitrarily to give priority to the running
    // sessions widget in the sidebar.
    app.shell.addToLeftArea(running, { rank: 200 });
}
