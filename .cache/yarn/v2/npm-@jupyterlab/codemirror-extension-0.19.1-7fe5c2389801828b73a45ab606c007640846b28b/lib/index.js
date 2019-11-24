"use strict";
// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const codemirror_1 = __importDefault(require("codemirror"));
const widgets_1 = require("@phosphor/widgets");
const mainmenu_1 = require("@jupyterlab/mainmenu");
const codeeditor_1 = require("@jupyterlab/codeeditor");
const codemirror_2 = require("@jupyterlab/codemirror");
const coreutils_1 = require("@jupyterlab/coreutils");
const fileeditor_1 = require("@jupyterlab/fileeditor");
/**
 * The command IDs used by the codemirror plugin.
 */
var CommandIDs;
(function (CommandIDs) {
    CommandIDs.changeKeyMap = 'codemirror:change-keymap';
    CommandIDs.changeTheme = 'codemirror:change-theme';
    CommandIDs.changeMode = 'codemirror:change-mode';
    CommandIDs.find = 'codemirror:find';
    CommandIDs.findAndReplace = 'codemirror:find-and-replace';
    CommandIDs.goToLine = 'codemirror:go-to-line';
})(CommandIDs || (CommandIDs = {}));
/**
 * The editor services.
 */
const services = {
    id: '@jupyterlab/codemirror-extension:services',
    provides: codeeditor_1.IEditorServices,
    activate: activateEditorServices
};
/**
 * The editor commands.
 */
const commands = {
    id: '@jupyterlab/codemirror-extension:commands',
    requires: [fileeditor_1.IEditorTracker, mainmenu_1.IMainMenu, coreutils_1.IStateDB, coreutils_1.ISettingRegistry],
    activate: activateEditorCommands,
    autoStart: true
};
/**
 * Export the plugins as default.
 */
const plugins = [commands, services];
exports.default = plugins;
/**
 * The plugin ID used as the key in the setting registry.
 */
const id = commands.id;
/**
 * Set up the editor services.
 */
function activateEditorServices(app) {
    codemirror_1.default.prototype.save = () => {
        app.commands.execute('docmanager:save');
    };
    return codemirror_2.editorServices;
}
/**
 * Set up the editor widget menu and commands.
 */
function activateEditorCommands(app, tracker, mainMenu, state, settingRegistry) {
    const { commands, restored } = app;
    let { theme, keyMap } = codemirror_2.CodeMirrorEditor.defaultConfig;
    /**
     * Update the setting values.
     */
    function updateSettings(settings) {
        keyMap = settings.get('keyMap').composite || keyMap;
        theme = settings.get('theme').composite || theme;
    }
    /**
     * Update the settings of the current tracker instances.
     */
    function updateTracker() {
        tracker.forEach(widget => {
            if (widget.content.editor instanceof codemirror_2.CodeMirrorEditor) {
                let cm = widget.content.editor.editor;
                cm.setOption('keyMap', keyMap);
                cm.setOption('theme', theme);
            }
        });
    }
    // Fetch the initial state of the settings.
    Promise.all([settingRegistry.load(id), restored])
        .then(([settings]) => {
        updateSettings(settings);
        updateTracker();
        settings.changed.connect(() => {
            updateSettings(settings);
            updateTracker();
        });
    })
        .catch((reason) => {
        console.error(reason.message);
        updateTracker();
    });
    /**
     * Handle the settings of new widgets.
     */
    tracker.widgetAdded.connect((sender, widget) => {
        if (widget.content.editor instanceof codemirror_2.CodeMirrorEditor) {
            let cm = widget.content.editor.editor;
            cm.setOption('keyMap', keyMap);
            cm.setOption('theme', theme);
        }
    });
    /**
     * A test for whether the tracker has an active widget.
     */
    function isEnabled() {
        return (tracker.currentWidget !== null &&
            tracker.currentWidget === app.shell.currentWidget);
    }
    /**
     * Create a menu for the editor.
     */
    const themeMenu = new widgets_1.Menu({ commands });
    const keyMapMenu = new widgets_1.Menu({ commands });
    const modeMenu = new widgets_1.Menu({ commands });
    themeMenu.title.label = 'Text Editor Theme';
    keyMapMenu.title.label = 'Text Editor Key Map';
    modeMenu.title.label = 'Text Editor Syntax Highlighting';
    commands.addCommand(CommandIDs.changeTheme, {
        label: args => args['theme'],
        execute: args => {
            const key = 'theme';
            const value = (theme = args['theme'] || theme);
            updateTracker();
            return settingRegistry.set(id, key, value).catch((reason) => {
                console.error(`Failed to set ${id}:${key} - ${reason.message}`);
            });
        },
        isToggled: args => args['theme'] === theme
    });
    commands.addCommand(CommandIDs.changeKeyMap, {
        label: args => {
            let title = args['keyMap'];
            return title === 'sublime' ? 'Sublime Text' : title;
        },
        execute: args => {
            const key = 'keyMap';
            const value = (keyMap = args['keyMap'] || keyMap);
            updateTracker();
            return settingRegistry.set(id, key, value).catch((reason) => {
                console.error(`Failed to set ${id}:${key} - ${reason.message}`);
            });
        },
        isToggled: args => args['keyMap'] === keyMap
    });
    commands.addCommand(CommandIDs.find, {
        label: 'Find...',
        execute: () => {
            let widget = tracker.currentWidget;
            if (!widget) {
                return;
            }
            let editor = widget.content.editor;
            editor.execCommand('find');
        },
        isEnabled
    });
    commands.addCommand(CommandIDs.findAndReplace, {
        label: 'Find and Replace...',
        execute: () => {
            let widget = tracker.currentWidget;
            if (!widget) {
                return;
            }
            let editor = widget.content.editor;
            editor.execCommand('replace');
        },
        isEnabled
    });
    commands.addCommand(CommandIDs.goToLine, {
        label: 'Go to Line...',
        execute: () => {
            let widget = tracker.currentWidget;
            if (!widget) {
                return;
            }
            let editor = widget.content.editor;
            editor.execCommand('jumpToLine');
        },
        isEnabled
    });
    commands.addCommand(CommandIDs.changeMode, {
        label: args => args['name'],
        execute: args => {
            let name = args['name'];
            let widget = tracker.currentWidget;
            if (name && widget) {
                let spec = codemirror_2.Mode.findByName(name);
                if (spec) {
                    widget.content.model.mimeType = spec.mime;
                }
            }
        },
        isEnabled,
        isToggled: args => {
            let widget = tracker.currentWidget;
            if (!widget) {
                return false;
            }
            let mime = widget.content.model.mimeType;
            let spec = codemirror_2.Mode.findByMIME(mime);
            let name = spec && spec.name;
            return args['name'] === name;
        }
    });
    codemirror_2.Mode.getModeInfo()
        .sort((a, b) => {
        let aName = a.name || '';
        let bName = b.name || '';
        return aName.localeCompare(bName);
    })
        .forEach(spec => {
        // Avoid mode name with a curse word.
        if (spec.mode.indexOf('brainf') === 0) {
            return;
        }
        modeMenu.addItem({
            command: CommandIDs.changeMode,
            args: Object.assign({}, spec)
        });
    });
    [
        'jupyter',
        'default',
        'abcdef',
        'base16-dark',
        'base16-light',
        'hopscotch',
        'material',
        'mbo',
        'mdn-like',
        'seti',
        'solarized dark',
        'solarized light',
        'the-matrix',
        'xq-light',
        'zenburn'
    ].forEach(name => themeMenu.addItem({
        command: CommandIDs.changeTheme,
        args: { theme: name }
    }));
    ['default', 'sublime', 'vim', 'emacs'].forEach(name => {
        keyMapMenu.addItem({
            command: CommandIDs.changeKeyMap,
            args: { keyMap: name }
        });
    });
    // Add some of the editor settings to the settings menu.
    mainMenu.settingsMenu.addGroup([
        { type: 'submenu', submenu: keyMapMenu },
        { type: 'submenu', submenu: themeMenu }
    ], 10);
    // Add the syntax highlighting submenu to the `View` menu.
    mainMenu.viewMenu.addGroup([{ type: 'submenu', submenu: modeMenu }], 40);
    // Add find-replace capabilities to the edit menu.
    mainMenu.editMenu.findReplacers.add({
        tracker,
        find: (widget) => {
            let editor = widget.content.editor;
            editor.execCommand('find');
        },
        findAndReplace: (widget) => {
            let editor = widget.content.editor;
            editor.execCommand('replace');
        }
    });
    // Add go to line capabilities to the edit menu.
    mainMenu.editMenu.goToLiners.add({
        tracker,
        find: (widget) => {
            let editor = widget.content.editor;
            editor.execCommand('jumpToLine');
        },
        goToLine: (widget) => {
            let editor = widget.content.editor;
            editor.execCommand('jumpToLine');
        }
    });
}
