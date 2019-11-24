"use strict";
/*-----------------------------------------------------------------------------
| Copyright (c) Jupyter Development Team.
| Distributed under the terms of the Modified BSD License.
|----------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const algorithm_1 = require("@phosphor/algorithm");
const commands_1 = require("@phosphor/commands");
const disposable_1 = require("@phosphor/disposable");
const widgets_1 = require("@phosphor/widgets");
/**
 * The command IDs used by the apputils extension.
 */
var CommandIDs;
(function (CommandIDs) {
    CommandIDs.activate = 'apputils:activate-command-palette';
})(CommandIDs || (CommandIDs = {}));
/**
 * A thin wrapper around the `CommandPalette` class to conform with the
 * JupyterLab interface for the application-wide command palette.
 */
class Palette {
    /**
     * Create a palette instance.
     */
    constructor(palette) {
        this._palette = palette;
        this._palette.title.iconClass = 'jp-PaletteIcon jp-SideBar-tabIcon';
        this._palette.title.label = '';
        this._palette.title.caption = 'Command Palette';
    }
    /**
     * The placeholder text of the command palette's search input.
     */
    set placeholder(placeholder) {
        this._palette.inputNode.placeholder = placeholder;
    }
    get placeholder() {
        return this._palette.inputNode.placeholder;
    }
    /**
     * Activate the command palette for user input.
     */
    activate() {
        this._palette.activate();
    }
    /**
     * Add a command item to the command palette.
     *
     * @param options - The options for creating the command item.
     *
     * @returns A disposable that will remove the item from the palette.
     */
    addItem(options) {
        let item = this._palette.addItem(options);
        return new disposable_1.DisposableDelegate(() => {
            this._palette.removeItem(item);
        });
    }
}
/**
 * Activate the command palette.
 */
function activatePalette(app) {
    const { commands, shell } = app;
    const palette = Private.createPalette(app);
    // Show the current palette shortcut in its title.
    const updatePaletteTitle = () => {
        const binding = algorithm_1.find(app.commands.keyBindings, b => b.command === CommandIDs.activate);
        if (binding) {
            const ks = commands_1.CommandRegistry.formatKeystroke(binding.keys.join(' '));
            palette.title.caption = `Commands (${ks})`;
        }
        else {
            palette.title.caption = 'Commands';
        }
    };
    updatePaletteTitle();
    app.commands.keyBindingChanged.connect(() => {
        updatePaletteTitle();
    });
    commands.addCommand(CommandIDs.activate, {
        execute: () => {
            shell.activateById(palette.id);
        },
        label: 'Activate Command Palette'
    });
    palette.inputNode.placeholder = 'SEARCH';
    shell.addToLeftArea(palette, { rank: 300 });
    return new Palette(palette);
}
exports.activatePalette = activatePalette;
/**
 * Restore the command palette.
 */
function restorePalette(app, restorer) {
    const palette = Private.createPalette(app);
    // Let the application restorer track the command palette for restoration of
    // application state (e.g. setting the command palette as the current side bar
    // widget).
    restorer.add(palette, 'command-palette');
}
exports.restorePalette = restorePalette;
/**
 * The namespace for module private data.
 */
var Private;
(function (Private) {
    /**
     * The private command palette instance.
     */
    let palette;
    /**
     * Create the application-wide command palette.
     */
    function createPalette(app) {
        if (!palette) {
            palette = new widgets_1.CommandPalette({ commands: app.commands });
            palette.id = 'command-palette';
            palette.title.label = 'Commands';
        }
        return palette;
    }
    Private.createPalette = createPalette;
})(Private || (Private = {}));
