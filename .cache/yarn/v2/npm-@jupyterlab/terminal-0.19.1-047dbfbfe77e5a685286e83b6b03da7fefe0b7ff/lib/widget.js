"use strict";
// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
Object.defineProperty(exports, "__esModule", { value: true });
const messaging_1 = require("@phosphor/messaging");
const widgets_1 = require("@phosphor/widgets");
const xterm_1 = require("xterm");
const fit_1 = require("xterm/lib/addons/fit");
/**
 * The class name added to a terminal widget.
 */
const TERMINAL_CLASS = 'jp-Terminal';
/**
 * The class name added to a terminal body.
 */
const TERMINAL_BODY_CLASS = 'jp-Terminal-body';
/**
 * A widget which manages a terminal session.
 */
class Terminal extends widgets_1.Widget {
    /**
     * Construct a new terminal widget.
     *
     * @param options - The terminal configuration options.
     */
    constructor(options = {}) {
        super();
        this._needsResize = true;
        this._theme = 'dark';
        this._session = null;
        this._termOpened = false;
        this._offsetWidth = -1;
        this._offsetHeight = -1;
        this.addClass(TERMINAL_CLASS);
        // Create the xterm.
        this._term = new xterm_1.Terminal(Private.getConfig(options));
        this._initializeTerm();
        // Initialize settings.
        let defaults = Terminal.defaultOptions;
        this._initialCommand = options.initialCommand || defaults.initialCommand;
        this.theme = options.theme || defaults.theme;
        this.id = `jp-Terminal-${Private.id++}`;
        this.title.label = 'Terminal';
    }
    /**
     * The terminal session associated with the widget.
     */
    get session() {
        return this._session;
    }
    set session(value) {
        if (this._session && !this._session.isDisposed) {
            this._session.messageReceived.disconnect(this._onMessage, this);
        }
        this._session = value || null;
        if (!value) {
            return;
        }
        value.ready.then(() => {
            if (this.isDisposed || value !== this._session) {
                return;
            }
            value.messageReceived.connect(this._onMessage, this);
            this.title.label = `Terminal ${value.name}`;
            this._setSessionSize();
            if (this._initialCommand) {
                this._session.send({
                    type: 'stdin',
                    content: [this._initialCommand + '\r']
                });
            }
        });
    }
    /**
     * Get the font size of the terminal in pixels.
     */
    get fontSize() {
        return this._term.getOption('fontSize');
    }
    /**
     * Set the font size of the terminal in pixels.
     */
    set fontSize(size) {
        if (this.fontSize === size) {
            return;
        }
        this._term.setOption('fontSize', size);
        this._needsResize = true;
        this.update();
    }
    /**
     * Get the current theme, either light or dark.
     */
    get theme() {
        return this._theme;
    }
    /**
     * Set the current theme, either light or dark.
     */
    set theme(value) {
        this._theme = value;
        if (value === 'light') {
            this.addClass('jp-mod-light');
            this._term.setOption('theme', Private.lightTheme);
        }
        else {
            this.removeClass('jp-mod-light');
            this._term.setOption('theme', Private.darkTheme);
        }
        this.update();
    }
    /**
     * Dispose of the resources held by the terminal widget.
     */
    dispose() {
        this._session = null;
        super.dispose();
    }
    /**
     * Refresh the terminal session.
     */
    refresh() {
        if (!this._session) {
            return Promise.reject(void 0);
        }
        return this._session.reconnect().then(() => {
            this._term.clear();
        });
    }
    /**
     * Process a message sent to the widget.
     *
     * @param msg - The message sent to the widget.
     *
     * #### Notes
     * Subclasses may reimplement this method as needed.
     */
    processMessage(msg) {
        super.processMessage(msg);
        switch (msg.type) {
            case 'fit-request':
                this.onFitRequest(msg);
                break;
            default:
                break;
        }
    }
    /**
     * Set the size of the terminal when attached if dirty.
     */
    onAfterAttach(msg) {
        this.update();
    }
    /**
     * Set the size of the terminal when shown if dirty.
     */
    onAfterShow(msg) {
        this.update();
    }
    /**
     * On resize, use the computed row and column sizes to resize the terminal.
     */
    onResize(msg) {
        this._offsetWidth = msg.width;
        this._offsetHeight = msg.height;
        this._needsResize = true;
        this.update();
    }
    /**
     * A message handler invoked on an `'update-request'` message.
     */
    onUpdateRequest(msg) {
        if (!this.isVisible || !this.isAttached) {
            return;
        }
        // Open the terminal if necessary.
        if (!this._termOpened) {
            this._term.open(this.node);
            this._term.element.classList.add(TERMINAL_BODY_CLASS);
            this._termOpened = true;
        }
        if (this._needsResize) {
            this._resizeTerminal();
        }
    }
    /**
     * A message handler invoked on an `'fit-request'` message.
     */
    onFitRequest(msg) {
        let resize = widgets_1.Widget.ResizeMessage.UnknownSize;
        messaging_1.MessageLoop.sendMessage(this, resize);
    }
    /**
     * Handle `'activate-request'` messages.
     */
    onActivateRequest(msg) {
        this._term.focus();
    }
    /**
     * Initialize the terminal object.
     */
    _initializeTerm() {
        this._term.on('data', (data) => {
            if (this._session) {
                this._session.send({
                    type: 'stdin',
                    content: [data]
                });
            }
        });
        this._term.on('title', (title) => {
            this.title.label = title;
        });
    }
    /**
     * Handle a message from the terminal session.
     */
    _onMessage(sender, msg) {
        switch (msg.type) {
            case 'stdout':
                if (msg.content) {
                    this._term.write(msg.content[0]);
                }
                break;
            case 'disconnect':
                this._term.write('\r\n\r\n[Finished... Term Session]\r\n');
                break;
            default:
                break;
        }
    }
    /**
     * Resize the terminal based on computed geometry.
     */
    _resizeTerminal() {
        fit_1.fit(this._term);
        if (this._offsetWidth === -1) {
            this._offsetWidth = this.node.offsetWidth;
        }
        if (this._offsetHeight === -1) {
            this._offsetHeight = this.node.offsetHeight;
        }
        this._setSessionSize();
        this._needsResize = false;
    }
    /**
     * Set the size of the terminal in the session.
     */
    _setSessionSize() {
        let content = [
            this._term.rows,
            this._term.cols,
            this._offsetHeight,
            this._offsetWidth
        ];
        if (this._session) {
            this._session.send({ type: 'set_size', content });
        }
    }
}
exports.Terminal = Terminal;
/**
 * The namespace for `Terminal` class statics.
 */
(function (Terminal) {
    /**
     * The default options used for creating terminals.
     */
    Terminal.defaultOptions = {
        theme: 'dark',
        fontSize: 13,
        cursorBlink: true,
        initialCommand: ''
    };
})(Terminal = exports.Terminal || (exports.Terminal = {}));
/**
 * A namespace for private data.
 */
var Private;
(function (Private) {
    /**
     * Get term.js options from ITerminalOptions.
     */
    function getConfig(options) {
        let config = {};
        if (options.cursorBlink !== void 0) {
            config.cursorBlink = options.cursorBlink;
        }
        else {
            config.cursorBlink = Terminal.defaultOptions.cursorBlink;
        }
        if (options.fontSize !== void 0) {
            config.fontSize = options.fontSize;
        }
        else {
            config.fontSize = Terminal.defaultOptions.fontSize;
        }
        return config;
    }
    Private.getConfig = getConfig;
    /**
     * An incrementing counter for ids.
     */
    Private.id = 0;
    /**
     * The light terminal theme.
     */
    Private.lightTheme = {
        foreground: '#000',
        background: '#fff',
        cursor: '#616161',
        cursorAccent: '#F5F5F5',
        selection: 'rgba(97, 97, 97, 0.3)' // md-grey-700
    };
    /**
     * The dark terminal theme.
     */
    Private.darkTheme = {
        foreground: '#fff',
        background: '#000',
        cursor: '#fff',
        cursorAccent: '#000',
        selection: 'rgba(255, 255, 255, 0.3)'
    };
})(Private || (Private = {}));
