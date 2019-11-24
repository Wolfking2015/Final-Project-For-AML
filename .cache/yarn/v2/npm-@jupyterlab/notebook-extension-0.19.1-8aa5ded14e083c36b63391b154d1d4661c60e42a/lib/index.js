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
const codeeditor_1 = require("@jupyterlab/codeeditor");
const coreutils_1 = require("@jupyterlab/coreutils");
const coreutils_2 = require("@phosphor/coreutils");
const filebrowser_1 = require("@jupyterlab/filebrowser");
const launcher_1 = require("@jupyterlab/launcher");
const mainmenu_1 = require("@jupyterlab/mainmenu");
const notebook_1 = require("@jupyterlab/notebook");
const rendermime_1 = require("@jupyterlab/rendermime");
const messaging_1 = require("@phosphor/messaging");
const widgets_1 = require("@phosphor/widgets");
/**
 * The command IDs used by the notebook plugin.
 */
var CommandIDs;
(function (CommandIDs) {
    CommandIDs.createNew = 'notebook:create-new';
    CommandIDs.interrupt = 'notebook:interrupt-kernel';
    CommandIDs.restart = 'notebook:restart-kernel';
    CommandIDs.restartClear = 'notebook:restart-clear-output';
    CommandIDs.restartRunAll = 'notebook:restart-run-all';
    CommandIDs.reconnectToKernel = 'notebook:reconnect-to-kernel';
    CommandIDs.changeKernel = 'notebook:change-kernel';
    CommandIDs.createConsole = 'notebook:create-console';
    CommandIDs.createOutputView = 'notebook:create-output-view';
    CommandIDs.clearAllOutputs = 'notebook:clear-all-cell-outputs';
    CommandIDs.closeAndShutdown = 'notebook:close-and-shutdown';
    CommandIDs.trust = 'notebook:trust';
    CommandIDs.exportToFormat = 'notebook:export-to-format';
    CommandIDs.run = 'notebook:run-cell';
    CommandIDs.runAndAdvance = 'notebook:run-cell-and-select-next';
    CommandIDs.runAndInsert = 'notebook:run-cell-and-insert-below';
    CommandIDs.runInConsole = 'notebook:run-in-console';
    CommandIDs.runAll = 'notebook:run-all-cells';
    CommandIDs.runAllAbove = 'notebook:run-all-above';
    CommandIDs.runAllBelow = 'notebook:run-all-below';
    CommandIDs.toCode = 'notebook:change-cell-to-code';
    CommandIDs.toMarkdown = 'notebook:change-cell-to-markdown';
    CommandIDs.toRaw = 'notebook:change-cell-to-raw';
    CommandIDs.cut = 'notebook:cut-cell';
    CommandIDs.copy = 'notebook:copy-cell';
    CommandIDs.pasteAbove = 'notebook:paste-cell-above';
    CommandIDs.pasteBelow = 'notebook:paste-cell-below';
    CommandIDs.pasteAndReplace = 'notebook:paste-and-replace-cell';
    CommandIDs.moveUp = 'notebook:move-cell-up';
    CommandIDs.moveDown = 'notebook:move-cell-down';
    CommandIDs.clearOutputs = 'notebook:clear-cell-output';
    CommandIDs.deleteCell = 'notebook:delete-cell';
    CommandIDs.insertAbove = 'notebook:insert-cell-above';
    CommandIDs.insertBelow = 'notebook:insert-cell-below';
    CommandIDs.selectAbove = 'notebook:move-cursor-up';
    CommandIDs.selectBelow = 'notebook:move-cursor-down';
    CommandIDs.extendAbove = 'notebook:extend-marked-cells-above';
    CommandIDs.extendBelow = 'notebook:extend-marked-cells-below';
    CommandIDs.selectAll = 'notebook:select-all';
    CommandIDs.deselectAll = 'notebook:deselect-all';
    CommandIDs.editMode = 'notebook:enter-edit-mode';
    CommandIDs.merge = 'notebook:merge-cells';
    CommandIDs.split = 'notebook:split-cell-at-cursor';
    CommandIDs.commandMode = 'notebook:enter-command-mode';
    CommandIDs.toggleAllLines = 'notebook:toggle-all-cell-line-numbers';
    CommandIDs.undoCellAction = 'notebook:undo-cell-action';
    CommandIDs.redoCellAction = 'notebook:redo-cell-action';
    CommandIDs.markdown1 = 'notebook:change-cell-to-heading-1';
    CommandIDs.markdown2 = 'notebook:change-cell-to-heading-2';
    CommandIDs.markdown3 = 'notebook:change-cell-to-heading-3';
    CommandIDs.markdown4 = 'notebook:change-cell-to-heading-4';
    CommandIDs.markdown5 = 'notebook:change-cell-to-heading-5';
    CommandIDs.markdown6 = 'notebook:change-cell-to-heading-6';
    CommandIDs.hideCode = 'notebook:hide-cell-code';
    CommandIDs.showCode = 'notebook:show-cell-code';
    CommandIDs.hideAllCode = 'notebook:hide-all-cell-code';
    CommandIDs.showAllCode = 'notebook:show-all-cell-code';
    CommandIDs.hideOutput = 'notebook:hide-cell-outputs';
    CommandIDs.showOutput = 'notebook:show-cell-outputs';
    CommandIDs.hideAllOutputs = 'notebook:hide-all-cell-outputs';
    CommandIDs.showAllOutputs = 'notebook:show-all-cell-outputs';
    CommandIDs.enableOutputScrolling = 'notebook:enable-output-scrolling';
    CommandIDs.disableOutputScrolling = 'notebook:disable-output-scrolling';
    CommandIDs.saveWithView = 'notebook:save-with-view';
})(CommandIDs || (CommandIDs = {}));
/**
 * The class name for the notebook icon from the default theme.
 */
const NOTEBOOK_ICON_CLASS = 'jp-NotebookIcon';
/**
 * The name of the factory that creates notebooks.
 */
const FACTORY = 'Notebook';
/**
 * The rank of the cell tools tab in the sidebar
 */
const CELL_TOOLS_RANK = 400;
/**
 * The exluded Export To ...
 * (returned from nbconvert's export list)
 */
const FORMAT_EXCLUDE = ['notebook', 'python', 'custom'];
/**
 * The exluded Cell Inspector Raw NbConvert Formats
 * (returned from nbconvert's export list)
 */
const RAW_FORMAT_EXCLUDE = ['pdf', 'slides', 'script', 'notebook', 'custom'];
/**
 * The default Export To ... formats and their human readable labels.
 */
const FORMAT_LABEL = {
    html: 'HTML',
    latex: 'LaTeX',
    markdown: 'Markdown',
    pdf: 'PDF',
    rst: 'ReStructured Text',
    script: 'Executable Script',
    slides: 'Reveal.js Slides'
};
/**
 * The notebook widget tracker provider.
 */
const trackerPlugin = {
    id: '@jupyterlab/notebook-extension:tracker',
    provides: notebook_1.INotebookTracker,
    requires: [
        mainmenu_1.IMainMenu,
        apputils_1.ICommandPalette,
        notebook_1.NotebookPanel.IContentFactory,
        codeeditor_1.IEditorServices,
        application_1.ILayoutRestorer,
        rendermime_1.IRenderMimeRegistry,
        coreutils_1.ISettingRegistry
    ],
    optional: [filebrowser_1.IFileBrowserFactory, launcher_1.ILauncher],
    activate: activateNotebookHandler,
    autoStart: true
};
/**
 * The notebook cell factory provider.
 */
const factory = {
    id: '@jupyterlab/notebook-extension:factory',
    provides: notebook_1.NotebookPanel.IContentFactory,
    requires: [codeeditor_1.IEditorServices],
    autoStart: true,
    activate: (app, editorServices) => {
        let editorFactory = editorServices.factoryService.newInlineEditor;
        return new notebook_1.NotebookPanel.ContentFactory({ editorFactory });
    }
};
/**
 * The cell tools extension.
 */
const tools = {
    activate: activateCellTools,
    provides: notebook_1.ICellTools,
    id: '@jupyterlab/notebook-extension:tools',
    autoStart: true,
    requires: [notebook_1.INotebookTracker, codeeditor_1.IEditorServices, coreutils_1.IStateDB]
};
/**
 * Export the plugins as default.
 */
const plugins = [factory, trackerPlugin, tools];
exports.default = plugins;
/**
 * Activate the cell tools extension.
 */
function activateCellTools(app, tracker, editorServices, state) {
    const id = 'cell-tools';
    const celltools = new notebook_1.CellTools({ tracker });
    const activeCellTool = new notebook_1.CellTools.ActiveCellTool();
    const slideShow = notebook_1.CellTools.createSlideShowSelector();
    const editorFactory = editorServices.factoryService.newInlineEditor;
    const metadataEditor = new notebook_1.CellTools.MetadataEditorTool({ editorFactory });
    const services = app.serviceManager;
    // Create message hook for triggers to save to the database.
    const hook = (sender, message) => {
        switch (message.type) {
            case 'activate-request':
                state.save(id, { open: true });
                break;
            case 'after-hide':
            case 'close-request':
                state.remove(id);
                break;
            default:
                break;
        }
        return true;
    };
    let optionsMap = {};
    optionsMap.None = '-';
    services.nbconvert.getExportFormats().then(response => {
        if (response) {
            // convert exportList to palette and menu items
            const formatList = Object.keys(response);
            formatList.forEach(function (key) {
                if (RAW_FORMAT_EXCLUDE.indexOf(key) === -1) {
                    let capCaseKey = key[0].toUpperCase() + key.substr(1);
                    let labelStr = FORMAT_LABEL[key] ? FORMAT_LABEL[key] : capCaseKey;
                    let mimeType = response[key].output_mimetype;
                    optionsMap[labelStr] = mimeType;
                }
            });
            const nbConvert = notebook_1.CellTools.createNBConvertSelector(optionsMap);
            celltools.addItem({ tool: nbConvert, rank: 3 });
        }
    });
    celltools.title.iconClass = 'jp-BuildIcon jp-SideBar-tabIcon';
    celltools.title.caption = 'Cell Inspector';
    celltools.id = id;
    celltools.addItem({ tool: activeCellTool, rank: 1 });
    celltools.addItem({ tool: slideShow, rank: 2 });
    celltools.addItem({ tool: metadataEditor, rank: 4 });
    messaging_1.MessageLoop.installMessageHook(celltools, hook);
    // Wait until the application has finished restoring before rendering.
    Promise.all([state.fetch(id), app.restored]).then(([args]) => {
        const open = !!(args && args['open']);
        // After initial restoration, check if the cell tools should render.
        if (tracker.size) {
            app.shell.addToLeftArea(celltools, { rank: CELL_TOOLS_RANK });
            if (open) {
                app.shell.activateById(celltools.id);
            }
        }
        // For all subsequent widget changes, check if the cell tools should render.
        app.shell.currentChanged.connect((sender, args) => {
            // If there are any open notebooks, add cell tools to the side panel if
            // it is not already there.
            if (tracker.size) {
                if (!celltools.isAttached) {
                    app.shell.addToLeftArea(celltools, { rank: CELL_TOOLS_RANK });
                }
                return;
            }
            // If there are no notebooks, close cell tools.
            celltools.close();
        });
    });
    return Promise.resolve(celltools);
}
/**
 * Activate the notebook handler extension.
 */
function activateNotebookHandler(app, mainMenu, palette, contentFactory, editorServices, restorer, rendermime, settingRegistry, browserFactory, launcher) {
    const services = app.serviceManager;
    // An object for tracking the current notebook settings.
    let editorConfig = notebook_1.StaticNotebook.defaultEditorConfig;
    const factory = new notebook_1.NotebookWidgetFactory({
        name: FACTORY,
        fileTypes: ['notebook'],
        modelName: 'notebook',
        defaultFor: ['notebook'],
        preferKernel: true,
        canStartKernel: true,
        rendermime: rendermime,
        contentFactory,
        editorConfig,
        mimeTypeService: editorServices.mimeTypeService
    });
    const { commands, restored } = app;
    const tracker = new notebook_1.NotebookTracker({ namespace: 'notebook' });
    // Handle state restoration.
    restorer.restore(tracker, {
        command: 'docmanager:open',
        args: panel => ({ path: panel.context.path, factory: FACTORY }),
        name: panel => panel.context.path,
        when: services.ready
    });
    let registry = app.docRegistry;
    registry.addModelFactory(new notebook_1.NotebookModelFactory({}));
    registry.addWidgetFactory(factory);
    addCommands(app, services, tracker);
    populatePalette(palette, services);
    let id = 0; // The ID counter for notebook panels.
    factory.widgetCreated.connect((sender, widget) => {
        // If the notebook panel does not have an ID, assign it one.
        widget.id = widget.id || `notebook-${++id}`;
        widget.title.icon = NOTEBOOK_ICON_CLASS;
        // Notify the instance tracker if restore data needs to update.
        widget.context.pathChanged.connect(() => {
            tracker.save(widget);
        });
        // Add the notebook panel to the tracker.
        tracker.add(widget);
    });
    /**
     * Update the setting values.
     */
    function updateConfig(settings) {
        let cached = settings.get('codeCellConfig').composite;
        let code = Object.assign({}, notebook_1.StaticNotebook.defaultEditorConfig.code);
        Object.keys(code).forEach((key) => {
            code[key] =
                cached[key] === null || cached[key] === undefined
                    ? code[key]
                    : cached[key];
        });
        cached = settings.get('markdownCellConfig').composite;
        let markdown = Object.assign({}, notebook_1.StaticNotebook.defaultEditorConfig.markdown);
        Object.keys(markdown).forEach((key) => {
            markdown[key] =
                cached[key] === null || cached[key] === undefined
                    ? markdown[key]
                    : cached[key];
        });
        cached = settings.get('rawCellConfig').composite;
        let raw = Object.assign({}, notebook_1.StaticNotebook.defaultEditorConfig.raw);
        Object.keys(raw).forEach((key) => {
            raw[key] =
                cached[key] === null || cached[key] === undefined
                    ? raw[key]
                    : cached[key];
        });
        factory.editorConfig = editorConfig = { code, markdown, raw };
    }
    /**
     * Update the settings of the current tracker instances.
     */
    function updateTracker() {
        tracker.forEach(widget => {
            widget.content.editorConfig = editorConfig;
        });
    }
    // Fetch the initial state of the settings.
    Promise.all([settingRegistry.load(trackerPlugin.id), restored])
        .then(([settings]) => {
        updateConfig(settings);
        updateTracker();
        settings.changed.connect(() => {
            updateConfig(settings);
            updateTracker();
        });
    })
        .catch((reason) => {
        console.error(reason.message);
        updateTracker();
    });
    // Add main menu notebook menu.
    populateMenus(app, mainMenu, tracker, services, palette);
    // Utility function to create a new notebook.
    const createNew = (cwd, kernelName) => {
        return commands
            .execute('docmanager:new-untitled', { path: cwd, type: 'notebook' })
            .then(model => {
            return commands.execute('docmanager:open', {
                path: model.path,
                factory: FACTORY,
                kernel: { name: kernelName }
            });
        });
    };
    // Add a command for creating a new notebook.
    commands.addCommand(CommandIDs.createNew, {
        label: args => {
            const kernelName = args['kernelName'] || '';
            if (args['isLauncher'] && args['kernelName']) {
                return services.specs.kernelspecs[kernelName].display_name;
            }
            if (args['isPalette']) {
                return 'New Notebook';
            }
            return 'Notebook';
        },
        caption: 'Create a new notebook',
        iconClass: args => (args['isPalette'] ? '' : 'jp-NotebookIcon'),
        execute: args => {
            const cwd = args['cwd'] ||
                (browserFactory ? browserFactory.defaultBrowser.model.path : '');
            const kernelName = args['kernelName'] || '';
            return createNew(cwd, kernelName);
        }
    });
    // Add a launcher item if the launcher is available.
    if (launcher) {
        services.ready.then(() => {
            const specs = services.specs;
            const baseUrl = coreutils_1.PageConfig.getBaseUrl();
            for (let name in specs.kernelspecs) {
                let rank = name === specs.default ? 0 : Infinity;
                let kernelIconUrl = specs.kernelspecs[name].resources['logo-64x64'];
                if (kernelIconUrl) {
                    let index = kernelIconUrl.indexOf('kernelspecs');
                    kernelIconUrl = baseUrl + kernelIconUrl.slice(index);
                }
                launcher.add({
                    command: CommandIDs.createNew,
                    args: { isLauncher: true, kernelName: name },
                    category: 'Notebook',
                    rank,
                    kernelIconUrl
                });
            }
        });
    }
    // Cell context menu groups
    app.contextMenu.addItem({
        type: 'separator',
        selector: '.jp-Notebook .jp-Cell',
        rank: 0
    });
    app.contextMenu.addItem({
        command: CommandIDs.cut,
        selector: '.jp-Notebook .jp-Cell',
        rank: 1
    });
    app.contextMenu.addItem({
        command: CommandIDs.copy,
        selector: '.jp-Notebook .jp-Cell',
        rank: 2
    });
    app.contextMenu.addItem({
        command: CommandIDs.pasteBelow,
        selector: '.jp-Notebook .jp-Cell',
        rank: 3
    });
    app.contextMenu.addItem({
        type: 'separator',
        selector: '.jp-Notebook .jp-Cell',
        rank: 4
    });
    app.contextMenu.addItem({
        command: CommandIDs.deleteCell,
        selector: '.jp-Notebook .jp-Cell',
        rank: 5
    });
    app.contextMenu.addItem({
        type: 'separator',
        selector: '.jp-Notebook .jp-Cell',
        rank: 6
    });
    app.contextMenu.addItem({
        command: CommandIDs.split,
        selector: '.jp-Notebook .jp-Cell',
        rank: 7
    });
    app.contextMenu.addItem({
        type: 'separator',
        selector: '.jp-Notebook .jp-Cell',
        rank: 8
    });
    // CodeCell context menu groups
    app.contextMenu.addItem({
        command: CommandIDs.createOutputView,
        selector: '.jp-Notebook .jp-CodeCell',
        rank: 9
    });
    app.contextMenu.addItem({
        type: 'separator',
        selector: '.jp-Notebook .jp-CodeCell',
        rank: 10
    });
    app.contextMenu.addItem({
        command: CommandIDs.clearOutputs,
        selector: '.jp-Notebook .jp-CodeCell',
        rank: 11
    });
    // Notebook context menu groups
    app.contextMenu.addItem({
        command: CommandIDs.clearAllOutputs,
        selector: '.jp-Notebook',
        rank: 0
    });
    app.contextMenu.addItem({
        type: 'separator',
        selector: '.jp-Notebook',
        rank: 1
    });
    app.contextMenu.addItem({
        command: CommandIDs.enableOutputScrolling,
        selector: '.jp-Notebook',
        rank: 2
    });
    app.contextMenu.addItem({
        command: CommandIDs.disableOutputScrolling,
        selector: '.jp-Notebook',
        rank: 3
    });
    app.contextMenu.addItem({
        type: 'separator',
        selector: '.jp-Notebook',
        rank: 4
    });
    app.contextMenu.addItem({
        command: CommandIDs.undoCellAction,
        selector: '.jp-Notebook',
        rank: 5
    });
    app.contextMenu.addItem({
        command: CommandIDs.redoCellAction,
        selector: '.jp-Notebook',
        rank: 6
    });
    app.contextMenu.addItem({
        command: CommandIDs.restart,
        selector: '.jp-Notebook',
        rank: 7
    });
    app.contextMenu.addItem({
        type: 'separator',
        selector: '.jp-Notebook',
        rank: 8
    });
    app.contextMenu.addItem({
        command: CommandIDs.createConsole,
        selector: '.jp-Notebook',
        rank: 9
    });
    return tracker;
}
/**
 * Add the notebook commands to the application's command registry.
 */
function addCommands(app, services, tracker) {
    const { commands, shell } = app;
    // Get the current widget and activate unless the args specify otherwise.
    function getCurrent(args) {
        const widget = tracker.currentWidget;
        const activate = args['activate'] !== false;
        if (activate && widget) {
            shell.activateById(widget.id);
        }
        return widget;
    }
    /**
     * Whether there is an active notebook.
     */
    function isEnabled() {
        return (tracker.currentWidget !== null &&
            tracker.currentWidget === app.shell.currentWidget);
    }
    /**
     * Whether there is an notebook active, with a single selected cell.
     */
    function isEnabledAndSingleSelected() {
        if (!isEnabled()) {
            return false;
        }
        const { content } = tracker.currentWidget;
        const index = content.activeCellIndex;
        // If there are selections that are not the active cell,
        // this command is confusing, so disable it.
        for (let i = 0; i < content.widgets.length; ++i) {
            if (content.isSelected(content.widgets[i]) && i !== index) {
                return false;
            }
        }
        return true;
    }
    commands.addCommand(CommandIDs.runAndAdvance, {
        label: 'Run Selected Cells',
        execute: args => {
            const current = getCurrent(args);
            if (current) {
                const { context, content } = current;
                return notebook_1.NotebookActions.runAndAdvance(content, context.session);
            }
        },
        isEnabled
    });
    commands.addCommand(CommandIDs.run, {
        label: "Run Selected Cells and Don't Advance",
        execute: args => {
            const current = getCurrent(args);
            if (current) {
                const { context, content } = current;
                return notebook_1.NotebookActions.run(content, context.session);
            }
        },
        isEnabled
    });
    commands.addCommand(CommandIDs.runAndInsert, {
        label: 'Run Selected Cells and Insert Below',
        execute: args => {
            const current = getCurrent(args);
            if (current) {
                const { context, content } = current;
                return notebook_1.NotebookActions.runAndInsert(content, context.session);
            }
        },
        isEnabled
    });
    commands.addCommand(CommandIDs.runInConsole, {
        label: 'Run Selected Text or Current Line in Console',
        execute: (args) => __awaiter(this, void 0, void 0, function* () {
            // Default to not activating the notebook (thereby putting the notebook
            // into command mode)
            const current = getCurrent(Object.assign({ activate: false }, args));
            if (!current) {
                return;
            }
            const { context, content } = current;
            let cell = content.activeCell;
            let path = context.path;
            // ignore action in non-code cell
            if (!cell || cell.model.type !== 'code') {
                return;
            }
            let code;
            const editor = cell.editor;
            const selection = editor.getSelection();
            const { start, end } = selection;
            let selected = start.column !== end.column || start.line !== end.line;
            if (selected) {
                // Get the selected code from the editor.
                const start = editor.getOffsetAt(selection.start);
                const end = editor.getOffsetAt(selection.end);
                code = editor.model.value.text.substring(start, end);
            }
            else {
                // no selection, submit whole line and advance
                code = editor.getLine(selection.start.line);
                const cursor = editor.getCursorPosition();
                if (cursor.line + 1 !== editor.lineCount) {
                    editor.setCursorPosition({
                        line: cursor.line + 1,
                        column: cursor.column
                    });
                }
            }
            if (!code) {
                return;
            }
            yield commands.execute('console:open', {
                activate: false,
                insertMode: 'split-bottom',
                path
            });
            yield commands.execute('console:inject', {
                activate: false,
                code,
                path
            });
        }),
        isEnabled
    });
    commands.addCommand(CommandIDs.runAll, {
        label: 'Run All Cells',
        execute: args => {
            const current = getCurrent(args);
            if (current) {
                const { context, content } = current;
                return notebook_1.NotebookActions.runAll(content, context.session);
            }
        },
        isEnabled
    });
    commands.addCommand(CommandIDs.runAllAbove, {
        label: 'Run All Above Selected Cell',
        execute: args => {
            const current = getCurrent(args);
            if (current) {
                const { context, content } = current;
                return notebook_1.NotebookActions.runAllAbove(content, context.session);
            }
        },
        isEnabled: () => {
            // Can't run above if there are multiple cells selected,
            // or if we are at the top of the notebook.
            return (isEnabledAndSingleSelected() &&
                tracker.currentWidget.content.activeCellIndex !== 0);
        }
    });
    commands.addCommand(CommandIDs.runAllBelow, {
        label: 'Run Selected Cell and All Below',
        execute: args => {
            const current = getCurrent(args);
            if (current) {
                const { context, content } = current;
                return notebook_1.NotebookActions.runAllBelow(content, context.session);
            }
        },
        isEnabled: () => {
            // Can't run below if there are multiple cells selected,
            // or if we are at the bottom of the notebook.
            return (isEnabledAndSingleSelected() &&
                tracker.currentWidget.content.activeCellIndex !==
                    tracker.currentWidget.content.widgets.length - 1);
        }
    });
    commands.addCommand(CommandIDs.restart, {
        label: 'Restart Kernel…',
        execute: args => {
            const current = getCurrent(args);
            if (current) {
                return current.session.restart();
            }
        },
        isEnabled
    });
    commands.addCommand(CommandIDs.closeAndShutdown, {
        label: 'Close and Shutdown',
        execute: args => {
            const current = getCurrent(args);
            if (!current) {
                return;
            }
            const fileName = current.title.label;
            return apputils_1.showDialog({
                title: 'Shutdown the notebook?',
                body: `Are you sure you want to close "${fileName}"?`,
                buttons: [apputils_1.Dialog.cancelButton(), apputils_1.Dialog.warnButton()]
            }).then(result => {
                if (result.button.accept) {
                    return current.context.session.shutdown().then(() => {
                        current.dispose();
                    });
                }
            });
        },
        isEnabled
    });
    commands.addCommand(CommandIDs.trust, {
        label: () => 'Trust Notebook',
        execute: args => {
            const current = getCurrent(args);
            if (current) {
                const { context, content } = current;
                return notebook_1.NotebookActions.trust(content).then(() => context.save());
            }
        },
        isEnabled
    });
    commands.addCommand(CommandIDs.exportToFormat, {
        label: args => {
            const formatLabel = args['label'];
            return (args['isPalette'] ? 'Export Notebook to ' : '') + formatLabel;
        },
        execute: args => {
            const current = getCurrent(args);
            if (!current) {
                return;
            }
            const notebookPath = coreutils_1.URLExt.encodeParts(current.context.path);
            const url = coreutils_1.URLExt.join(services.serverSettings.baseUrl, 'nbconvert', args['format'], notebookPath) + '?download=true';
            const child = window.open('', '_blank');
            const { context } = current;
            if (context.model.dirty && !context.model.readOnly) {
                return context.save().then(() => {
                    child.location.assign(url);
                });
            }
            return new Promise(resolve => {
                child.location.assign(url);
                resolve(undefined);
            });
        },
        isEnabled
    });
    commands.addCommand(CommandIDs.restartClear, {
        label: 'Restart Kernel and Clear All Outputs…',
        execute: args => {
            const current = getCurrent(args);
            if (current) {
                const { content, session } = current;
                return session.restart().then(() => {
                    notebook_1.NotebookActions.clearAllOutputs(content);
                });
            }
        },
        isEnabled
    });
    commands.addCommand(CommandIDs.restartRunAll, {
        label: 'Restart Kernel and Run All Cells…',
        execute: args => {
            const current = getCurrent(args);
            if (current) {
                const { context, content, session } = current;
                return session.restart().then(restarted => {
                    if (restarted) {
                        notebook_1.NotebookActions.runAll(content, context.session);
                    }
                    return restarted;
                });
            }
        },
        isEnabled
    });
    commands.addCommand(CommandIDs.clearAllOutputs, {
        label: 'Clear All Outputs',
        execute: args => {
            const current = getCurrent(args);
            if (current) {
                return notebook_1.NotebookActions.clearAllOutputs(current.content);
            }
        },
        isEnabled
    });
    commands.addCommand(CommandIDs.clearOutputs, {
        label: 'Clear Outputs',
        execute: args => {
            const current = getCurrent(args);
            if (current) {
                return notebook_1.NotebookActions.clearOutputs(current.content);
            }
        },
        isEnabled
    });
    commands.addCommand(CommandIDs.interrupt, {
        label: 'Interrupt Kernel',
        execute: args => {
            const current = getCurrent(args);
            if (!current) {
                return;
            }
            const kernel = current.context.session.kernel;
            if (kernel) {
                return kernel.interrupt();
            }
        },
        isEnabled
    });
    commands.addCommand(CommandIDs.toCode, {
        label: 'Change to Code Cell Type',
        execute: args => {
            const current = getCurrent(args);
            if (current) {
                return notebook_1.NotebookActions.changeCellType(current.content, 'code');
            }
        },
        isEnabled
    });
    commands.addCommand(CommandIDs.toMarkdown, {
        label: 'Change to Markdown Cell Type',
        execute: args => {
            const current = getCurrent(args);
            if (current) {
                return notebook_1.NotebookActions.changeCellType(current.content, 'markdown');
            }
        },
        isEnabled
    });
    commands.addCommand(CommandIDs.toRaw, {
        label: 'Change to Raw Cell Type',
        execute: args => {
            const current = getCurrent(args);
            if (current) {
                return notebook_1.NotebookActions.changeCellType(current.content, 'raw');
            }
        },
        isEnabled
    });
    commands.addCommand(CommandIDs.cut, {
        label: 'Cut Cells',
        execute: args => {
            const current = getCurrent(args);
            if (current) {
                return notebook_1.NotebookActions.cut(current.content);
            }
        },
        isEnabled
    });
    commands.addCommand(CommandIDs.copy, {
        label: 'Copy Cells',
        execute: args => {
            const current = getCurrent(args);
            if (current) {
                return notebook_1.NotebookActions.copy(current.content);
            }
        },
        isEnabled
    });
    commands.addCommand(CommandIDs.pasteBelow, {
        label: 'Paste Cells Below',
        execute: args => {
            const current = getCurrent(args);
            if (current) {
                return notebook_1.NotebookActions.paste(current.content, 'below');
            }
        },
        isEnabled
    });
    commands.addCommand(CommandIDs.pasteAbove, {
        label: 'Paste Cells Above',
        execute: args => {
            const current = getCurrent(args);
            if (current) {
                return notebook_1.NotebookActions.paste(current.content, 'above');
            }
        },
        isEnabled
    });
    commands.addCommand(CommandIDs.pasteAndReplace, {
        label: 'Paste Cells and Replace',
        execute: args => {
            const current = getCurrent(args);
            if (current) {
                return notebook_1.NotebookActions.paste(current.content, 'replace');
            }
        },
        isEnabled
    });
    commands.addCommand(CommandIDs.deleteCell, {
        label: 'Delete Cells',
        execute: args => {
            const current = getCurrent(args);
            if (current) {
                return notebook_1.NotebookActions.deleteCells(current.content);
            }
        },
        isEnabled
    });
    commands.addCommand(CommandIDs.split, {
        label: 'Split Cell',
        execute: args => {
            const current = getCurrent(args);
            if (current) {
                return notebook_1.NotebookActions.splitCell(current.content);
            }
        },
        isEnabled
    });
    commands.addCommand(CommandIDs.merge, {
        label: 'Merge Selected Cells',
        execute: args => {
            const current = getCurrent(args);
            if (current) {
                return notebook_1.NotebookActions.mergeCells(current.content);
            }
        },
        isEnabled
    });
    commands.addCommand(CommandIDs.insertAbove, {
        label: 'Insert Cell Above',
        execute: args => {
            const current = getCurrent(args);
            if (current) {
                return notebook_1.NotebookActions.insertAbove(current.content);
            }
        },
        isEnabled
    });
    commands.addCommand(CommandIDs.insertBelow, {
        label: 'Insert Cell Below',
        execute: args => {
            const current = getCurrent(args);
            if (current) {
                return notebook_1.NotebookActions.insertBelow(current.content);
            }
        },
        isEnabled
    });
    commands.addCommand(CommandIDs.selectAbove, {
        label: 'Select Cell Above',
        execute: args => {
            const current = getCurrent(args);
            if (current) {
                return notebook_1.NotebookActions.selectAbove(current.content);
            }
        },
        isEnabled
    });
    commands.addCommand(CommandIDs.selectBelow, {
        label: 'Select Cell Below',
        execute: args => {
            const current = getCurrent(args);
            if (current) {
                return notebook_1.NotebookActions.selectBelow(current.content);
            }
        },
        isEnabled
    });
    commands.addCommand(CommandIDs.extendAbove, {
        label: 'Extend Selection Above',
        execute: args => {
            const current = getCurrent(args);
            if (current) {
                return notebook_1.NotebookActions.extendSelectionAbove(current.content);
            }
        },
        isEnabled
    });
    commands.addCommand(CommandIDs.extendBelow, {
        label: 'Extend Selection Below',
        execute: args => {
            const current = getCurrent(args);
            if (current) {
                return notebook_1.NotebookActions.extendSelectionBelow(current.content);
            }
        },
        isEnabled
    });
    commands.addCommand(CommandIDs.selectAll, {
        label: 'Select All Cells',
        execute: args => {
            const current = getCurrent(args);
            if (current) {
                return notebook_1.NotebookActions.selectAll(current.content);
            }
        },
        isEnabled
    });
    commands.addCommand(CommandIDs.deselectAll, {
        label: 'Deselect All Cells',
        execute: args => {
            const current = getCurrent(args);
            if (current) {
                return notebook_1.NotebookActions.deselectAll(current.content);
            }
        },
        isEnabled
    });
    commands.addCommand(CommandIDs.moveUp, {
        label: 'Move Cells Up',
        execute: args => {
            const current = getCurrent(args);
            if (current) {
                return notebook_1.NotebookActions.moveUp(current.content);
            }
        },
        isEnabled
    });
    commands.addCommand(CommandIDs.moveDown, {
        label: 'Move Cells Down',
        execute: args => {
            const current = getCurrent(args);
            if (current) {
                return notebook_1.NotebookActions.moveDown(current.content);
            }
        },
        isEnabled
    });
    commands.addCommand(CommandIDs.toggleAllLines, {
        label: 'Toggle All Line Numbers',
        execute: args => {
            const current = getCurrent(args);
            if (current) {
                return notebook_1.NotebookActions.toggleAllLineNumbers(current.content);
            }
        },
        isEnabled
    });
    commands.addCommand(CommandIDs.commandMode, {
        label: 'Enter Command Mode',
        execute: args => {
            const current = getCurrent(args);
            if (current) {
                current.content.mode = 'command';
            }
        },
        isEnabled
    });
    commands.addCommand(CommandIDs.editMode, {
        label: 'Enter Edit Mode',
        execute: args => {
            const current = getCurrent(args);
            if (current) {
                current.content.mode = 'edit';
            }
        },
        isEnabled
    });
    commands.addCommand(CommandIDs.undoCellAction, {
        label: 'Undo Cell Operation',
        execute: args => {
            const current = getCurrent(args);
            if (current) {
                return notebook_1.NotebookActions.undo(current.content);
            }
        },
        isEnabled
    });
    commands.addCommand(CommandIDs.redoCellAction, {
        label: 'Redo Cell Operation',
        execute: args => {
            const current = getCurrent(args);
            if (current) {
                return notebook_1.NotebookActions.redo(current.content);
            }
        },
        isEnabled
    });
    commands.addCommand(CommandIDs.changeKernel, {
        label: 'Change Kernel…',
        execute: args => {
            const current = getCurrent(args);
            if (current) {
                return current.context.session.selectKernel();
            }
        },
        isEnabled
    });
    commands.addCommand(CommandIDs.reconnectToKernel, {
        label: 'Reconnect To Kernel',
        execute: args => {
            const current = getCurrent(args);
            if (!current) {
                return;
            }
            const kernel = current.context.session.kernel;
            if (kernel) {
                return kernel.reconnect();
            }
        },
        isEnabled
    });
    commands.addCommand(CommandIDs.createOutputView, {
        label: 'Create New View for Output',
        execute: args => {
            // Clone the OutputArea
            const current = getCurrent(Object.assign({}, args, { activate: false }));
            const nb = current.content;
            const content = nb.activeCell.cloneOutputArea();
            // Create a MainAreaWidget
            const widget = new apputils_1.MainAreaWidget({ content });
            widget.id = `LinkedOutputView-${coreutils_2.UUID.uuid4()}`;
            widget.title.label = 'Output View';
            widget.title.icon = NOTEBOOK_ICON_CLASS;
            widget.title.caption = current.title.label
                ? `For Notebook: ${current.title.label}`
                : 'For Notebook:';
            widget.addClass('jp-LinkedOutputView');
            current.context.addSibling(widget, {
                ref: current.id,
                mode: 'split-bottom'
            });
            // Remove the output view if the parent notebook is closed.
            nb.disposed.connect(widget.dispose);
        },
        isEnabled: isEnabledAndSingleSelected
    });
    commands.addCommand(CommandIDs.createConsole, {
        label: 'New Console for Notebook',
        execute: args => {
            const current = getCurrent(Object.assign({}, args, { activate: false }));
            const widget = tracker.currentWidget;
            if (!current || !widget) {
                return;
            }
            const options = {
                path: widget.context.path,
                preferredLanguage: widget.context.model.defaultKernelLanguage,
                activate: args['activate'],
                ref: current.id,
                insertMode: 'split-bottom'
            };
            return commands.execute('console:create', options);
        },
        isEnabled
    });
    commands.addCommand(CommandIDs.markdown1, {
        label: 'Change to Heading 1',
        execute: args => {
            const current = getCurrent(args);
            if (current) {
                return notebook_1.NotebookActions.setMarkdownHeader(current.content, 1);
            }
        },
        isEnabled
    });
    commands.addCommand(CommandIDs.markdown2, {
        label: 'Change to Heading 2',
        execute: args => {
            const current = getCurrent(args);
            if (current) {
                return notebook_1.NotebookActions.setMarkdownHeader(current.content, 2);
            }
        },
        isEnabled
    });
    commands.addCommand(CommandIDs.markdown3, {
        label: 'Change to Heading 3',
        execute: args => {
            const current = getCurrent(args);
            if (current) {
                return notebook_1.NotebookActions.setMarkdownHeader(current.content, 3);
            }
        },
        isEnabled
    });
    commands.addCommand(CommandIDs.markdown4, {
        label: 'Change to Heading 4',
        execute: args => {
            const current = getCurrent(args);
            if (current) {
                return notebook_1.NotebookActions.setMarkdownHeader(current.content, 4);
            }
        },
        isEnabled
    });
    commands.addCommand(CommandIDs.markdown5, {
        label: 'Change to Heading 5',
        execute: args => {
            const current = getCurrent(args);
            if (current) {
                return notebook_1.NotebookActions.setMarkdownHeader(current.content, 5);
            }
        },
        isEnabled
    });
    commands.addCommand(CommandIDs.markdown6, {
        label: 'Change to Heading 6',
        execute: args => {
            const current = getCurrent(args);
            if (current) {
                return notebook_1.NotebookActions.setMarkdownHeader(current.content, 6);
            }
        },
        isEnabled
    });
    commands.addCommand(CommandIDs.hideCode, {
        label: 'Collapse Selected Code',
        execute: args => {
            const current = getCurrent(args);
            if (current) {
                return notebook_1.NotebookActions.hideCode(current.content);
            }
        },
        isEnabled
    });
    commands.addCommand(CommandIDs.showCode, {
        label: 'Expand Selected Code',
        execute: args => {
            const current = getCurrent(args);
            if (current) {
                return notebook_1.NotebookActions.showCode(current.content);
            }
        },
        isEnabled
    });
    commands.addCommand(CommandIDs.hideAllCode, {
        label: 'Collapse All Code',
        execute: args => {
            const current = getCurrent(args);
            if (current) {
                return notebook_1.NotebookActions.hideAllCode(current.content);
            }
        },
        isEnabled
    });
    commands.addCommand(CommandIDs.showAllCode, {
        label: 'Expand All Code',
        execute: args => {
            const current = getCurrent(args);
            if (current) {
                return notebook_1.NotebookActions.showAllCode(current.content);
            }
        },
        isEnabled
    });
    commands.addCommand(CommandIDs.hideOutput, {
        label: 'Collapse Selected Outputs',
        execute: args => {
            const current = getCurrent(args);
            if (current) {
                return notebook_1.NotebookActions.hideOutput(current.content);
            }
        },
        isEnabled
    });
    commands.addCommand(CommandIDs.showOutput, {
        label: 'Expand Selected Outputs',
        execute: args => {
            const current = getCurrent(args);
            if (current) {
                return notebook_1.NotebookActions.showOutput(current.content);
            }
        },
        isEnabled
    });
    commands.addCommand(CommandIDs.hideAllOutputs, {
        label: 'Collapse All Outputs',
        execute: args => {
            const current = getCurrent(args);
            if (current) {
                return notebook_1.NotebookActions.hideAllOutputs(current.content);
            }
        },
        isEnabled
    });
    commands.addCommand(CommandIDs.showAllOutputs, {
        label: 'Expand All Outputs',
        execute: args => {
            const current = getCurrent(args);
            if (current) {
                return notebook_1.NotebookActions.showAllOutputs(current.content);
            }
        },
        isEnabled
    });
    commands.addCommand(CommandIDs.enableOutputScrolling, {
        label: 'Enable Scrolling for Outputs',
        execute: args => {
            const current = getCurrent(args);
            if (current) {
                return notebook_1.NotebookActions.enableOutputScrolling(current.content);
            }
        },
        isEnabled
    });
    commands.addCommand(CommandIDs.disableOutputScrolling, {
        label: 'Disable Scrolling for Outputs',
        execute: args => {
            const current = getCurrent(args);
            if (current) {
                return notebook_1.NotebookActions.disableOutputScrolling(current.content);
            }
        },
        isEnabled
    });
    commands.addCommand(CommandIDs.saveWithView, {
        label: 'Save Notebook with View State',
        execute: args => {
            const current = getCurrent(args);
            if (current) {
                notebook_1.NotebookActions.persistViewState(current.content);
                app.commands.execute('docmanager:save');
            }
        },
        isEnabled: args => {
            return isEnabled() && commands.isEnabled('docmanager:save', args);
        }
    });
}
/**
 * Populate the application's command palette with notebook commands.
 */
function populatePalette(palette, services) {
    let category = 'Notebook Operations';
    [
        CommandIDs.interrupt,
        CommandIDs.restart,
        CommandIDs.restartClear,
        CommandIDs.restartRunAll,
        CommandIDs.runAll,
        CommandIDs.runAllAbove,
        CommandIDs.runAllBelow,
        CommandIDs.selectAll,
        CommandIDs.deselectAll,
        CommandIDs.clearAllOutputs,
        CommandIDs.toggleAllLines,
        CommandIDs.editMode,
        CommandIDs.commandMode,
        CommandIDs.changeKernel,
        CommandIDs.reconnectToKernel,
        CommandIDs.createConsole,
        CommandIDs.closeAndShutdown,
        CommandIDs.trust,
        CommandIDs.saveWithView
    ].forEach(command => {
        palette.addItem({ command, category });
    });
    palette.addItem({
        command: CommandIDs.createNew,
        category,
        args: { isPalette: true }
    });
    category = 'Notebook Cell Operations';
    [
        CommandIDs.run,
        CommandIDs.runAndAdvance,
        CommandIDs.runAndInsert,
        CommandIDs.runInConsole,
        CommandIDs.clearOutputs,
        CommandIDs.toCode,
        CommandIDs.toMarkdown,
        CommandIDs.toRaw,
        CommandIDs.cut,
        CommandIDs.copy,
        CommandIDs.pasteBelow,
        CommandIDs.pasteAbove,
        CommandIDs.pasteAndReplace,
        CommandIDs.deleteCell,
        CommandIDs.split,
        CommandIDs.merge,
        CommandIDs.insertAbove,
        CommandIDs.insertBelow,
        CommandIDs.selectAbove,
        CommandIDs.selectBelow,
        CommandIDs.extendAbove,
        CommandIDs.extendBelow,
        CommandIDs.moveDown,
        CommandIDs.moveUp,
        CommandIDs.undoCellAction,
        CommandIDs.redoCellAction,
        CommandIDs.markdown1,
        CommandIDs.markdown2,
        CommandIDs.markdown3,
        CommandIDs.markdown4,
        CommandIDs.markdown5,
        CommandIDs.markdown6,
        CommandIDs.hideCode,
        CommandIDs.showCode,
        CommandIDs.hideAllCode,
        CommandIDs.showAllCode,
        CommandIDs.hideOutput,
        CommandIDs.showOutput,
        CommandIDs.hideAllOutputs,
        CommandIDs.showAllOutputs,
        CommandIDs.enableOutputScrolling,
        CommandIDs.disableOutputScrolling
    ].forEach(command => {
        palette.addItem({ command, category });
    });
}
/**
 * Populates the application menus for the notebook.
 */
function populateMenus(app, mainMenu, tracker, services, palette) {
    let { commands } = app;
    // Add undo/redo hooks to the edit menu.
    mainMenu.editMenu.undoers.add({
        tracker,
        undo: widget => {
            widget.content.activeCell.editor.undo();
        },
        redo: widget => {
            widget.content.activeCell.editor.redo();
        }
    });
    // Add a clearer to the edit menu
    mainMenu.editMenu.clearers.add({
        tracker,
        noun: 'Outputs',
        pluralNoun: 'Outputs',
        clearCurrent: (current) => {
            return notebook_1.NotebookActions.clearOutputs(current.content);
        },
        clearAll: (current) => {
            return notebook_1.NotebookActions.clearAllOutputs(current.content);
        }
    });
    // Add new notebook creation to the file menu.
    mainMenu.fileMenu.newMenu.addGroup([{ command: CommandIDs.createNew }], 10);
    // Add a close and shutdown command to the file menu.
    mainMenu.fileMenu.closeAndCleaners.add({
        tracker,
        action: 'Shutdown',
        name: 'Notebook',
        closeAndCleanup: (current) => {
            const fileName = current.title.label;
            return apputils_1.showDialog({
                title: 'Shutdown the notebook?',
                body: `Are you sure you want to close "${fileName}"?`,
                buttons: [apputils_1.Dialog.cancelButton(), apputils_1.Dialog.warnButton()]
            }).then(result => {
                if (result.button.accept) {
                    return current.context.session.shutdown().then(() => {
                        current.dispose();
                    });
                }
            });
        }
    });
    // Add a save with view command to the file menu.
    mainMenu.fileMenu.persistAndSavers.add({
        tracker,
        action: 'with View State',
        name: 'Notebook',
        persistAndSave: (current) => {
            notebook_1.NotebookActions.persistViewState(current.content);
            return app.commands.execute('docmanager:save');
        }
    });
    // Add a notebook group to the File menu.
    let exportTo = new widgets_1.Menu({ commands });
    exportTo.title.label = 'Export Notebook As…';
    services.nbconvert.getExportFormats().then(response => {
        if (response) {
            // convert exportList to palette and menu items
            const formatList = Object.keys(response);
            const category = 'Notebook Operations';
            formatList.forEach(function (key) {
                let capCaseKey = key[0].toUpperCase() + key.substr(1);
                let labelStr = FORMAT_LABEL[key] ? FORMAT_LABEL[key] : capCaseKey;
                let args = {
                    format: key,
                    label: labelStr,
                    isPalette: true
                };
                if (FORMAT_EXCLUDE.indexOf(key) === -1) {
                    exportTo.addItem({
                        command: CommandIDs.exportToFormat,
                        args: args
                    });
                    palette.addItem({
                        command: CommandIDs.exportToFormat,
                        category,
                        args
                    });
                }
            });
            const fileGroup = [
                { command: CommandIDs.trust },
                { type: 'submenu', submenu: exportTo }
            ];
            mainMenu.fileMenu.addGroup(fileGroup, 10);
        }
    });
    // Add a kernel user to the Kernel menu
    mainMenu.kernelMenu.kernelUsers.add({
        tracker,
        interruptKernel: current => {
            let kernel = current.session.kernel;
            if (kernel) {
                return kernel.interrupt();
            }
            return Promise.resolve(void 0);
        },
        noun: 'All Outputs',
        restartKernel: current => current.session.restart(),
        restartKernelAndClear: current => {
            return current.session.restart().then(restarted => {
                if (restarted) {
                    notebook_1.NotebookActions.clearAllOutputs(current.content);
                }
                return restarted;
            });
        },
        changeKernel: current => current.session.selectKernel(),
        shutdownKernel: current => current.session.shutdown()
    });
    // Add a console creator the the Kernel menu
    mainMenu.fileMenu.consoleCreators.add({
        tracker,
        name: 'Notebook',
        createConsole: current => {
            const options = {
                path: current.context.path,
                preferredLanguage: current.context.model.defaultKernelLanguage,
                activate: true,
                ref: current.id,
                insertMode: 'split-bottom'
            };
            return commands.execute('console:create', options);
        }
    });
    // Add some commands to the application view menu.
    const collapseGroup = [
        CommandIDs.hideCode,
        CommandIDs.hideOutput,
        CommandIDs.hideAllCode,
        CommandIDs.hideAllOutputs
    ].map(command => {
        return { command };
    });
    mainMenu.viewMenu.addGroup(collapseGroup, 10);
    const expandGroup = [
        CommandIDs.showCode,
        CommandIDs.showOutput,
        CommandIDs.showAllCode,
        CommandIDs.showAllOutputs
    ].map(command => {
        return { command };
    });
    mainMenu.viewMenu.addGroup(expandGroup, 11);
    // Add an IEditorViewer to the application view menu
    mainMenu.viewMenu.editorViewers.add({
        tracker,
        toggleLineNumbers: widget => {
            notebook_1.NotebookActions.toggleAllLineNumbers(widget.content);
        },
        lineNumbersToggled: widget => {
            const config = widget.content.editorConfig;
            return !!(config.code.lineNumbers &&
                config.markdown.lineNumbers &&
                config.raw.lineNumbers);
        }
    });
    // Add an ICodeRunner to the application run menu
    mainMenu.runMenu.codeRunners.add({
        tracker,
        noun: 'Cells',
        run: current => {
            const { context, content } = current;
            return notebook_1.NotebookActions.runAndAdvance(content, context.session).then(() => void 0);
        },
        runAll: current => {
            const { context, content } = current;
            return notebook_1.NotebookActions.runAll(content, context.session).then(() => void 0);
        },
        restartAndRunAll: current => {
            const { context, content } = current;
            return context.session.restart().then(restarted => {
                if (restarted) {
                    notebook_1.NotebookActions.runAll(content, context.session);
                }
                return restarted;
            });
        }
    });
    // Add a run+insert and run+don't advance group to the run menu.
    const runExtras = [
        CommandIDs.runAndInsert,
        CommandIDs.run,
        CommandIDs.runInConsole
    ].map(command => {
        return { command };
    });
    // Add a run all above/below group to the run menu.
    const runAboveBelowGroup = [
        CommandIDs.runAllAbove,
        CommandIDs.runAllBelow
    ].map(command => {
        return { command };
    });
    // Add commands to the application edit menu.
    const undoCellActionGroup = [
        CommandIDs.undoCellAction,
        CommandIDs.redoCellAction
    ].map(command => {
        return { command };
    });
    const copyGroup = [
        CommandIDs.cut,
        CommandIDs.copy,
        CommandIDs.pasteBelow,
        CommandIDs.pasteAbove,
        CommandIDs.pasteAndReplace
    ].map(command => {
        return { command };
    });
    const selectGroup = [CommandIDs.selectAll, CommandIDs.deselectAll].map(command => {
        return { command };
    });
    const splitMergeGroup = [CommandIDs.split, CommandIDs.merge].map(command => {
        return { command };
    });
    const moveCellsGroup = [CommandIDs.moveUp, CommandIDs.moveDown].map(command => {
        return { command };
    });
    mainMenu.editMenu.addGroup(undoCellActionGroup, 4);
    mainMenu.editMenu.addGroup(copyGroup, 5);
    mainMenu.editMenu.addGroup([{ command: CommandIDs.deleteCell }], 6);
    mainMenu.editMenu.addGroup(selectGroup, 7);
    mainMenu.editMenu.addGroup(moveCellsGroup, 8);
    mainMenu.editMenu.addGroup(splitMergeGroup, 9);
    mainMenu.runMenu.addGroup(runExtras, 10);
    mainMenu.runMenu.addGroup(runAboveBelowGroup, 11);
    // Add kernel information to the application help menu.
    mainMenu.helpMenu.kernelUsers.add({
        tracker,
        getKernel: current => current.session.kernel
    });
}
