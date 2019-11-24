"use strict";
// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
Object.defineProperty(exports, "__esModule", { value: true });
const application_1 = require("@jupyterlab/application");
const apputils_1 = require("@jupyterlab/apputils");
const codeeditor_1 = require("@jupyterlab/codeeditor");
const console_1 = require("@jupyterlab/console");
const coreutils_1 = require("@jupyterlab/coreutils");
const filebrowser_1 = require("@jupyterlab/filebrowser");
const fileeditor_1 = require("@jupyterlab/fileeditor");
const launcher_1 = require("@jupyterlab/launcher");
const mainmenu_1 = require("@jupyterlab/mainmenu");
const widgets_1 = require("@phosphor/widgets");
/**
 * The class name for the text editor icon from the default theme.
 */
const EDITOR_ICON_CLASS = 'jp-TextEditorIcon';
/**
 * The name of the factory that creates editor widgets.
 */
const FACTORY = 'Editor';
/**
 * The command IDs used by the fileeditor plugin.
 */
var CommandIDs;
(function (CommandIDs) {
    CommandIDs.createNew = 'fileeditor:create-new';
    CommandIDs.changeFontSize = 'fileeditor:change-font-size';
    CommandIDs.lineNumbers = 'fileeditor:toggle-line-numbers';
    CommandIDs.lineWrap = 'fileeditor:toggle-line-wrap';
    CommandIDs.changeTabs = 'fileeditor:change-tabs';
    CommandIDs.matchBrackets = 'fileeditor:toggle-match-brackets';
    CommandIDs.autoClosingBrackets = 'fileeditor:toggle-autoclosing-brackets';
    CommandIDs.createConsole = 'fileeditor:create-console';
    CommandIDs.runCode = 'fileeditor:run-code';
    CommandIDs.markdownPreview = 'fileeditor:markdown-preview';
})(CommandIDs || (CommandIDs = {}));
/**
 * The editor tracker extension.
 */
const plugin = {
    activate,
    id: '@jupyterlab/fileeditor-extension:plugin',
    requires: [
        console_1.IConsoleTracker,
        codeeditor_1.IEditorServices,
        filebrowser_1.IFileBrowserFactory,
        application_1.ILayoutRestorer,
        coreutils_1.ISettingRegistry
    ],
    optional: [apputils_1.ICommandPalette, launcher_1.ILauncher, mainmenu_1.IMainMenu],
    provides: fileeditor_1.IEditorTracker,
    autoStart: true
};
/**
 * Export the plugins as default.
 */
exports.default = plugin;
/**
 * Activate the editor tracker plugin.
 */
function activate(app, consoleTracker, editorServices, browserFactory, restorer, settingRegistry, palette, launcher, menu) {
    const id = plugin.id;
    const namespace = 'editor';
    const factory = new fileeditor_1.FileEditorFactory({
        editorServices,
        factoryOptions: {
            name: FACTORY,
            fileTypes: ['markdown', '*'],
            defaultFor: ['markdown', '*'] // it outranks the defaultRendered viewer.
        }
    });
    const { commands, restored } = app;
    const tracker = new apputils_1.InstanceTracker({
        namespace
    });
    const isEnabled = () => tracker.currentWidget !== null &&
        tracker.currentWidget === app.shell.currentWidget;
    let config = Object.assign({}, codeeditor_1.CodeEditor.defaultConfig);
    // Handle state restoration.
    restorer.restore(tracker, {
        command: 'docmanager:open',
        args: widget => ({ path: widget.context.path, factory: FACTORY }),
        name: widget => widget.context.path
    });
    /**
     * Update the setting values.
     */
    function updateSettings(settings) {
        let cached = settings.get('editorConfig').composite;
        Object.keys(config).forEach((key) => {
            config[key] =
                cached[key] === null || cached[key] === undefined
                    ? codeeditor_1.CodeEditor.defaultConfig[key]
                    : cached[key];
        });
        // Trigger a refresh of the rendered commands
        app.commands.notifyCommandChanged();
    }
    /**
     * Update the settings of the current tracker instances.
     */
    function updateTracker() {
        tracker.forEach(widget => {
            updateWidget(widget.content);
        });
    }
    /**
     * Update the settings of a widget.
     */
    function updateWidget(widget) {
        const editor = widget.editor;
        Object.keys(config).forEach((key) => {
            editor.setOption(key, config[key]);
        });
    }
    // Add a console creator to the File menu
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
    factory.widgetCreated.connect((sender, widget) => {
        widget.title.icon = EDITOR_ICON_CLASS;
        // Notify the instance tracker if restore data needs to update.
        widget.context.pathChanged.connect(() => {
            tracker.save(widget);
        });
        tracker.add(widget);
        updateWidget(widget.content);
    });
    app.docRegistry.addWidgetFactory(factory);
    // Handle the settings of new widgets.
    tracker.widgetAdded.connect((sender, widget) => {
        updateWidget(widget.content);
    });
    // Add a command to change font size.
    commands.addCommand(CommandIDs.changeFontSize, {
        execute: args => {
            const delta = Number(args['delta']);
            if (Number.isNaN(delta)) {
                console.error(`${CommandIDs.changeFontSize}: delta arg must be a number`);
                return;
            }
            const style = window.getComputedStyle(document.documentElement);
            const cssSize = parseInt(style.getPropertyValue('--jp-code-font-size'), 10);
            const currentSize = config.fontSize || cssSize;
            config.fontSize = currentSize + delta;
            return settingRegistry
                .set(id, 'editorConfig', config)
                .catch((reason) => {
                console.error(`Failed to set ${id}: ${reason.message}`);
            });
        },
        isEnabled,
        label: args => args['name']
    });
    commands.addCommand(CommandIDs.lineNumbers, {
        execute: () => {
            config.lineNumbers = !config.lineNumbers;
            return settingRegistry
                .set(id, 'editorConfig', config)
                .catch((reason) => {
                console.error(`Failed to set ${id}: ${reason.message}`);
            });
        },
        isEnabled,
        isToggled: () => config.lineNumbers,
        label: 'Line Numbers'
    });
    commands.addCommand(CommandIDs.lineWrap, {
        execute: args => {
            const lineWrap = args['mode'] || 'off';
            config.lineWrap = lineWrap;
            return settingRegistry
                .set(id, 'editorConfig', config)
                .catch((reason) => {
                console.error(`Failed to set ${id}: ${reason.message}`);
            });
        },
        isEnabled,
        isToggled: args => {
            const lineWrap = args['mode'] || 'off';
            return config.lineWrap === lineWrap;
        },
        label: 'Word Wrap'
    });
    commands.addCommand(CommandIDs.changeTabs, {
        label: args => args['name'],
        execute: args => {
            config.tabSize = args['size'] || 4;
            config.insertSpaces = !!args['insertSpaces'];
            return settingRegistry
                .set(id, 'editorConfig', config)
                .catch((reason) => {
                console.error(`Failed to set ${id}: ${reason.message}`);
            });
        },
        isEnabled,
        isToggled: args => {
            const insertSpaces = !!args['insertSpaces'];
            const size = args['size'] || 4;
            return config.insertSpaces === insertSpaces && config.tabSize === size;
        }
    });
    commands.addCommand(CommandIDs.matchBrackets, {
        execute: () => {
            config.matchBrackets = !config.matchBrackets;
            return settingRegistry
                .set(id, 'editorConfig', config)
                .catch((reason) => {
                console.error(`Failed to set ${id}: ${reason.message}`);
            });
        },
        label: 'Match Brackets',
        isEnabled,
        isToggled: () => config.matchBrackets
    });
    commands.addCommand(CommandIDs.autoClosingBrackets, {
        execute: () => {
            config.autoClosingBrackets = !config.autoClosingBrackets;
            return settingRegistry
                .set(id, 'editorConfig', config)
                .catch((reason) => {
                console.error(`Failed to set ${id}: ${reason.message}`);
            });
        },
        label: 'Auto Close Brackets for Text Editor',
        isEnabled,
        isToggled: () => config.autoClosingBrackets
    });
    commands.addCommand(CommandIDs.createConsole, {
        execute: args => {
            const widget = tracker.currentWidget;
            if (!widget) {
                return;
            }
            return commands
                .execute('console:create', {
                activate: args['activate'],
                name: widget.context.contentsModel.name,
                path: widget.context.path,
                preferredLanguage: widget.context.model.defaultKernelLanguage,
                ref: widget.id,
                insertMode: 'split-bottom'
            })
                .then(console => {
                widget.context.pathChanged.connect((sender, value) => {
                    console.session.setPath(value);
                    console.session.setName(widget.context.contentsModel.name);
                });
            });
        },
        isEnabled,
        label: 'Create Console for Editor'
    });
    commands.addCommand(CommandIDs.runCode, {
        execute: () => {
            // Run the appropriate code, taking into account a ```fenced``` code block.
            const widget = tracker.currentWidget.content;
            if (!widget) {
                return;
            }
            let code = '';
            const editor = widget.editor;
            const path = widget.context.path;
            const extension = coreutils_1.PathExt.extname(path);
            const selection = editor.getSelection();
            const { start, end } = selection;
            let selected = start.column !== end.column || start.line !== end.line;
            if (selected) {
                // Get the selected code from the editor.
                const start = editor.getOffsetAt(selection.start);
                const end = editor.getOffsetAt(selection.end);
                code = editor.model.value.text.substring(start, end);
            }
            else if (coreutils_1.MarkdownCodeBlocks.isMarkdown(extension)) {
                const { text } = editor.model.value;
                const blocks = coreutils_1.MarkdownCodeBlocks.findMarkdownCodeBlocks(text);
                for (let block of blocks) {
                    if (block.startLine <= start.line && start.line <= block.endLine) {
                        code = block.code;
                        selected = true;
                        break;
                    }
                }
            }
            if (!selected) {
                // no selection, submit whole line and advance
                code = editor.getLine(selection.start.line);
                const cursor = editor.getCursorPosition();
                if (cursor.line + 1 === editor.lineCount) {
                    let text = editor.model.value.text;
                    editor.model.value.text = text + '\n';
                }
                editor.setCursorPosition({
                    line: cursor.line + 1,
                    column: cursor.column
                });
            }
            const activate = false;
            if (code) {
                return commands.execute('console:inject', { activate, code, path });
            }
            else {
                return Promise.resolve(void 0);
            }
        },
        isEnabled,
        label: 'Run Code'
    });
    commands.addCommand(CommandIDs.markdownPreview, {
        execute: () => {
            let widget = tracker.currentWidget;
            if (!widget) {
                return;
            }
            let path = widget.context.path;
            return commands.execute('markdownviewer:open', {
                path,
                options: {
                    mode: 'split-right'
                }
            });
        },
        isVisible: () => {
            let widget = tracker.currentWidget;
            return ((widget && coreutils_1.PathExt.extname(widget.context.path) === '.md') || false);
        },
        label: 'Show Markdown Preview'
    });
    // Function to create a new untitled text file, given
    // the current working directory.
    const createNew = (cwd) => {
        return commands
            .execute('docmanager:new-untitled', {
            path: cwd,
            type: 'file'
        })
            .then(model => {
            return commands.execute('docmanager:open', {
                path: model.path,
                factory: FACTORY
            });
        });
    };
    // Add a command for creating a new text file.
    commands.addCommand(CommandIDs.createNew, {
        label: 'Text File',
        caption: 'Create a new text file',
        iconClass: EDITOR_ICON_CLASS,
        execute: args => {
            let cwd = args['cwd'] || browserFactory.defaultBrowser.model.path;
            return createNew(cwd);
        }
    });
    // Add a launcher item if the launcher is available.
    if (launcher) {
        launcher.add({
            command: CommandIDs.createNew,
            category: 'Other',
            rank: 1
        });
    }
    if (palette) {
        let args = {
            insertSpaces: false,
            size: 4,
            name: 'Indent with Tab'
        };
        let command = 'fileeditor:change-tabs';
        palette.addItem({ command, args, category: 'Text Editor' });
        for (let size of [1, 2, 4, 8]) {
            let args = {
                insertSpaces: true,
                size,
                name: `Spaces: ${size} `
            };
            palette.addItem({ command, args, category: 'Text Editor' });
        }
        args = { name: 'Increase Font Size', delta: 1 };
        command = CommandIDs.changeFontSize;
        palette.addItem({ command, args, category: 'Text Editor' });
        args = { name: 'Decrease Font Size', delta: -1 };
        command = CommandIDs.changeFontSize;
        palette.addItem({ command, args, category: 'Text Editor' });
    }
    if (menu) {
        // Add the editing commands to the settings menu.
        const tabMenu = new widgets_1.Menu({ commands });
        tabMenu.title.label = 'Text Editor Indentation';
        let args = {
            insertSpaces: false,
            size: 4,
            name: 'Indent with Tab'
        };
        let command = 'fileeditor:change-tabs';
        tabMenu.addItem({ command, args });
        for (let size of [1, 2, 4, 8]) {
            let args = {
                insertSpaces: true,
                size,
                name: `Spaces: ${size} `
            };
            tabMenu.addItem({ command, args });
        }
        menu.settingsMenu.addGroup([
            {
                command: CommandIDs.changeFontSize,
                args: { name: 'Increase Text Editor Font Size', delta: +1 }
            },
            {
                command: CommandIDs.changeFontSize,
                args: { name: 'Decrease Text Editor Font Size', delta: -1 }
            },
            { type: 'submenu', submenu: tabMenu },
            { command: CommandIDs.autoClosingBrackets }
        ], 30);
        // Add new text file creation to the file menu.
        menu.fileMenu.newMenu.addGroup([{ command: CommandIDs.createNew }], 30);
        // Add undo/redo hooks to the edit menu.
        menu.editMenu.undoers.add({
            tracker,
            undo: widget => {
                widget.content.editor.undo();
            },
            redo: widget => {
                widget.content.editor.redo();
            }
        });
        // Add editor view options.
        menu.viewMenu.editorViewers.add({
            tracker,
            toggleLineNumbers: widget => {
                const lineNumbers = !widget.content.editor.getOption('lineNumbers');
                widget.content.editor.setOption('lineNumbers', lineNumbers);
            },
            toggleWordWrap: widget => {
                const oldValue = widget.content.editor.getOption('lineWrap');
                const newValue = oldValue === 'off' ? 'on' : 'off';
                widget.content.editor.setOption('lineWrap', newValue);
            },
            toggleMatchBrackets: widget => {
                const matchBrackets = !widget.content.editor.getOption('matchBrackets');
                widget.content.editor.setOption('matchBrackets', matchBrackets);
            },
            lineNumbersToggled: widget => widget.content.editor.getOption('lineNumbers'),
            wordWrapToggled: widget => widget.content.editor.getOption('lineWrap') !== 'off',
            matchBracketsToggled: widget => widget.content.editor.getOption('matchBrackets')
        });
        // Add a console creator the the Kernel menu.
        menu.fileMenu.consoleCreators.add({
            tracker,
            name: 'Editor',
            createConsole: current => {
                const options = {
                    path: current.context.path,
                    preferredLanguage: current.context.model.defaultKernelLanguage
                };
                return commands.execute('console:create', options);
            }
        });
        // Add a code runner to the Run menu.
        menu.runMenu.codeRunners.add({
            tracker,
            noun: 'Code',
            isEnabled: current => {
                let found = false;
                consoleTracker.forEach(console => {
                    if (console.console.session.path === current.context.path) {
                        found = true;
                    }
                });
                return found;
            },
            run: () => commands.execute(CommandIDs.runCode)
        });
    }
    app.contextMenu.addItem({
        command: CommandIDs.createConsole,
        selector: '.jp-FileEditor'
    });
    app.contextMenu.addItem({
        command: CommandIDs.markdownPreview,
        selector: '.jp-FileEditor'
    });
    return tracker;
}
