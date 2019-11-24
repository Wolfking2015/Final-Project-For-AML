"use strict";
// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
Object.defineProperty(exports, "__esModule", { value: true });
const application_1 = require("@jupyterlab/application");
const algorithm_1 = require("@phosphor/algorithm");
const widgets_1 = require("@phosphor/widgets");
require("../style/index.css");
/**
 * The default tab manager extension.
 */
const plugin = {
    id: '@jupyterlab/tabmanager-extension:plugin',
    activate: (app, restorer) => {
        const { shell } = app;
        const tabs = new widgets_1.TabBar({ orientation: 'vertical' });
        const header = document.createElement('header');
        restorer.add(tabs, 'tab-manager');
        tabs.id = 'tab-manager';
        tabs.title.iconClass = 'jp-TabIcon jp-SideBar-tabIcon';
        tabs.title.caption = 'Open Tabs';
        header.textContent = 'Open Tabs';
        tabs.node.insertBefore(header, tabs.contentNode);
        shell.addToLeftArea(tabs, { rank: 600 });
        app.restored.then(() => {
            const populate = () => {
                tabs.clearTabs();
                algorithm_1.each(shell.widgets('main'), widget => {
                    tabs.addTab(widget.title);
                });
            };
            // Connect signal handlers.
            shell.layoutModified.connect(() => {
                populate();
            });
            tabs.tabActivateRequested.connect((sender, tab) => {
                shell.activateById(tab.title.owner.id);
            });
            tabs.tabCloseRequested.connect((sender, tab) => {
                tab.title.owner.close();
            });
            // Populate the tab manager.
            populate();
        });
    },
    autoStart: true,
    requires: [application_1.ILayoutRestorer]
};
/**
 * Export the plugin as default.
 */
exports.default = plugin;
