"use strict";
// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
Object.defineProperty(exports, "__esModule", { value: true });
const apputils_1 = require("@jupyterlab/apputils");
const coreutils_1 = require("@jupyterlab/coreutils");
const coreutils_2 = require("@phosphor/coreutils");
const rendermime_1 = require("@jupyterlab/rendermime");
const coreutils_3 = require("@phosphor/coreutils");
const widgets_1 = require("@phosphor/widgets");
const widget_1 = require("./widget");
/**
 * The class name added to console panels.
 */
const PANEL_CLASS = 'jp-ConsolePanel';
const CONSOLE_ICON_CLASS = 'jp-CodeConsoleIcon';
/**
 * A panel which contains a console and the ability to add other children.
 */
class ConsolePanel extends widgets_1.Panel {
    /**
     * Construct a console panel.
     */
    constructor(options) {
        super();
        this._executed = null;
        this._connected = null;
        this.addClass(PANEL_CLASS);
        let { rendermime, mimeTypeService, path, basePath, name, manager, modelFactory } = options;
        let contentFactory = (this.contentFactory =
            options.contentFactory || ConsolePanel.defaultContentFactory);
        let count = Private.count++;
        if (!path) {
            path = `${basePath || ''}/console-${count}-${coreutils_2.UUID.uuid4()}`;
        }
        let session = (this._session = new apputils_1.ClientSession({
            manager: manager.sessions,
            path,
            name: name || `Console ${count}`,
            type: 'console',
            kernelPreference: options.kernelPreference,
            setBusy: options.setBusy
        }));
        let resolver = new rendermime_1.RenderMimeRegistry.UrlResolver({
            session,
            contents: manager.contents
        });
        rendermime = rendermime.clone({ resolver });
        this.console = contentFactory.createConsole({
            rendermime,
            session,
            mimeTypeService,
            contentFactory,
            modelFactory
        });
        this.addWidget(this.console);
        session.initialize().then(() => {
            this._connected = new Date();
            this._updateTitle();
        });
        this.console.executed.connect(this._onExecuted, this);
        this._updateTitle();
        session.kernelChanged.connect(this._updateTitle, this);
        session.propertyChanged.connect(this._updateTitle, this);
        this.title.icon = CONSOLE_ICON_CLASS;
        this.title.closable = true;
        this.id = `console-${count}`;
    }
    /**
     * The session used by the panel.
     */
    get session() {
        return this._session;
    }
    /**
     * Dispose of the resources held by the widget.
     */
    dispose() {
        this.session.dispose();
        this.console.dispose();
        super.dispose();
    }
    /**
     * Handle `'activate-request'` messages.
     */
    onActivateRequest(msg) {
        let prompt = this.console.promptCell;
        if (prompt) {
            prompt.editor.focus();
        }
    }
    /**
     * Handle `'close-request'` messages.
     */
    onCloseRequest(msg) {
        super.onCloseRequest(msg);
        this.dispose();
    }
    /**
     * Handle a console execution.
     */
    _onExecuted(sender, args) {
        this._executed = args;
        this._updateTitle();
    }
    /**
     * Update the console panel title.
     */
    _updateTitle() {
        Private.updateTitle(this, this._connected, this._executed);
    }
}
exports.ConsolePanel = ConsolePanel;
/**
 * A namespace for ConsolePanel statics.
 */
(function (ConsolePanel) {
    /**
     * Default implementation of `IContentFactory`.
     */
    class ContentFactory extends widget_1.CodeConsole.ContentFactory {
        /**
         * Create a new console panel.
         */
        createConsole(options) {
            return new widget_1.CodeConsole(options);
        }
    }
    ConsolePanel.ContentFactory = ContentFactory;
    /**
     * A default code console content factory.
     */
    ConsolePanel.defaultContentFactory = new ContentFactory();
    /* tslint:disable */
    /**
     * The console renderer token.
     */
    ConsolePanel.IContentFactory = new coreutils_3.Token('@jupyterlab/console:IContentFactory');
    /* tslint:enable */
})(ConsolePanel = exports.ConsolePanel || (exports.ConsolePanel = {}));
/**
 * A namespace for private data.
 */
var Private;
(function (Private) {
    /**
     * The counter for new consoles.
     */
    Private.count = 1;
    /**
     * Update the title of a console panel.
     */
    function updateTitle(panel, connected, executed) {
        let session = panel.console.session;
        let caption = `Name: ${session.name}\n` +
            `Directory: ${coreutils_1.PathExt.dirname(session.path)}\n` +
            `Kernel: ${session.kernelDisplayName}`;
        if (connected) {
            caption += `\nConnected: ${coreutils_1.Time.format(connected.toISOString())}`;
        }
        if (executed) {
            caption += `\nLast Execution: ${coreutils_1.Time.format(executed.toISOString())}`;
        }
        panel.title.label = session.name || 'Console';
        panel.title.caption = caption;
    }
    Private.updateTitle = updateTitle;
})(Private || (Private = {}));
