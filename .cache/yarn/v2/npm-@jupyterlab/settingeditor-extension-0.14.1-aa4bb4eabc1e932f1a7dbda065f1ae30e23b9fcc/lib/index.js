"use strict";
/*-----------------------------------------------------------------------------
| Copyright (c) Jupyter Development Team.
| Distributed under the terms of the Modified BSD License.
|----------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const application_1 = require("@jupyterlab/application");
const apputils_1 = require("@jupyterlab/apputils");
const codeeditor_1 = require("@jupyterlab/codeeditor");
const coreutils_1 = require("@jupyterlab/coreutils");
const rendermime_1 = require("@jupyterlab/rendermime");
const settingeditor_1 = require("@jupyterlab/settingeditor");
/**
 * The command IDs used by the setting editor.
 */
var CommandIDs;
(function (CommandIDs) {
    CommandIDs.debug = 'settingeditor:debug';
    CommandIDs.open = 'settingeditor:open';
    CommandIDs.revert = 'settingeditor:revert';
    CommandIDs.save = 'settingeditor:save';
})(CommandIDs || (CommandIDs = {}));
/**
 * The default setting editor extension.
 */
const plugin = {
    id: '@jupyterlab/settingeditor-extension:plugin',
    requires: [
        application_1.ILayoutRestorer,
        coreutils_1.ISettingRegistry,
        codeeditor_1.IEditorServices,
        coreutils_1.IStateDB,
        rendermime_1.IRenderMimeRegistry,
        apputils_1.ICommandPalette
    ],
    autoStart: true,
    provides: settingeditor_1.ISettingEditorTracker,
    activate
};
/**
 * Activate the setting editor extension.
 */
function activate(app, restorer, registry, editorServices, state, rendermime, palette) {
    const { commands, shell } = app;
    const namespace = 'setting-editor';
    const factoryService = editorServices.factoryService;
    const editorFactory = factoryService.newInlineEditor;
    const tracker = new apputils_1.InstanceTracker({
        namespace
    });
    let editor;
    // Handle state restoration.
    restorer.restore(tracker, {
        command: CommandIDs.open,
        args: widget => ({}),
        name: widget => namespace
    });
    commands.addCommand(CommandIDs.debug, {
        execute: () => {
            tracker.currentWidget.content.toggleDebug();
        },
        iconClass: 'jp-MaterialIcon jp-BugIcon',
        label: 'Debug User Settings In Inspector',
        isToggled: () => tracker.currentWidget.content.isDebugVisible
    });
    commands.addCommand(CommandIDs.open, {
        execute: () => {
            if (tracker.currentWidget) {
                shell.activateById(tracker.currentWidget.id);
                return;
            }
            const key = plugin.id;
            const when = app.restored;
            editor = new settingeditor_1.SettingEditor({
                commands: {
                    registry: commands,
                    debug: CommandIDs.debug,
                    revert: CommandIDs.revert,
                    save: CommandIDs.save
                },
                editorFactory,
                key,
                registry,
                rendermime,
                state,
                when
            });
            // Notify the command registry when the visibility status of the setting
            // editor's commands change. The setting editor toolbar listens for this
            // signal from the command registry.
            editor.commandsChanged.connect((sender, args) => {
                args.forEach(id => {
                    commands.notifyCommandChanged(id);
                });
            });
            editor.id = namespace;
            editor.title.label = 'Settings';
            editor.title.iconClass = 'jp-SettingsIcon';
            let main = new apputils_1.MainAreaWidget({ content: editor });
            tracker.add(main);
            shell.addToMainArea(main);
        },
        label: 'Advanced Settings Editor'
    });
    palette.addItem({ category: 'Settings', command: CommandIDs.open });
    commands.addCommand(CommandIDs.revert, {
        execute: () => {
            tracker.currentWidget.content.revert();
        },
        iconClass: 'jp-MaterialIcon jp-UndoIcon',
        label: 'Revert User Settings',
        isEnabled: () => tracker.currentWidget.content.canRevertRaw
    });
    commands.addCommand(CommandIDs.save, {
        execute: () => tracker.currentWidget.content.save(),
        iconClass: 'jp-MaterialIcon jp-SaveIcon',
        label: 'Save User Settings',
        isEnabled: () => tracker.currentWidget.content.canSaveRaw
    });
    return tracker;
}
exports.default = plugin;
