"use strict";
// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
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
const extensionmanager_1 = require("@jupyterlab/extensionmanager");
/**
 * IDs of the commands added by this extension.
 */
var CommandIDs;
(function (CommandIDs) {
    CommandIDs.enable = 'extensionmanager:enable';
    CommandIDs.hide = 'extensionmanager:hide-main';
    CommandIDs.show = 'extensionmanager:activate-main';
    CommandIDs.toggle = 'extensionmanager:toggle-main';
})(CommandIDs || (CommandIDs = {}));
/**
 * The extension manager plugin.
 */
const plugin = {
    id: '@jupyterlab/extensionmanager-extension:plugin',
    autoStart: true,
    requires: [coreutils_1.ISettingRegistry, application_1.ILayoutRestorer, application_1.IRouter],
    activate: (app, registry, restorer, router) => __awaiter(this, void 0, void 0, function* () {
        const settings = yield registry.load(plugin.id);
        let enabled = settings.composite['enabled'] === true;
        const { shell, serviceManager } = app;
        let view;
        const createView = () => {
            const v = new extensionmanager_1.ExtensionView(serviceManager);
            v.id = 'extensionmanager.main-view';
            v.title.iconClass = 'jp-ExtensionIcon jp-SideBar-tabIcon';
            v.title.caption = 'Extension Manager';
            restorer.add(v, v.id);
            return v;
        };
        if (enabled) {
            view = createView();
            shell.addToLeftArea(view, { rank: 1000 });
        }
        // If the extension is enabled or disabled,
        // add or remove it from the left area.
        app.restored.then(() => {
            settings.changed.connect(() => __awaiter(this, void 0, void 0, function* () {
                enabled = settings.composite['enabled'] === true;
                if (enabled && (!view || (view && !view.isAttached))) {
                    const accepted = yield Private.showWarning();
                    if (!accepted) {
                        settings.set('enabled', false);
                        return;
                    }
                    view = view || createView();
                    shell.addToLeftArea(view);
                }
                else if (!enabled && view && view.isAttached) {
                    view.close();
                }
            }));
        });
        addCommands(app, view);
    })
};
/**
 * Add the main file view commands to the application's command registry.
 */
function addCommands(app, view) {
    const { commands } = app;
    commands.addCommand(CommandIDs.show, {
        label: 'Show Extension Manager',
        execute: () => {
            app.shell.activateById(view.id);
        }
    });
    commands.addCommand(CommandIDs.hide, {
        execute: () => {
            if (!view.isHidden) {
                app.shell.collapseLeft();
            }
        }
    });
    commands.addCommand(CommandIDs.toggle, {
        execute: () => {
            if (view.isHidden) {
                return commands.execute(CommandIDs.show, undefined);
            }
            else {
                return commands.execute(CommandIDs.hide, undefined);
            }
        }
    });
    // TODO: Also add to command palette
}
/**
 * Export the plugin as the default.
 */
exports.default = plugin;
/**
 * A namespace for module-private functions.
 */
var Private;
(function (Private) {
    /**
     * Show a warning dialog about extension security.
     *
     * @returns whether the user accepted the dialog.
     */
    function showWarning() {
        return __awaiter(this, void 0, void 0, function* () {
            return apputils_1.showDialog({
                title: 'Enable Extension Manager?',
                body: "Thanks for trying out JupyterLab's extension manager. " +
                    'The JupyterLab development team is excited to have a robust ' +
                    'third-party extension community. ' +
                    'However, we cannot vouch for every extension, ' +
                    'and some may introduce security risks. ' +
                    'Do you want to continue?',
                buttons: [
                    apputils_1.Dialog.cancelButton({ label: 'DISABLE' }),
                    apputils_1.Dialog.warnButton({ label: 'ENABLE' })
                ]
            }).then(result => {
                if (result.button.accept) {
                    return true;
                }
                else {
                    return false;
                }
            });
        });
    }
    Private.showWarning = showWarning;
})(Private || (Private = {}));
