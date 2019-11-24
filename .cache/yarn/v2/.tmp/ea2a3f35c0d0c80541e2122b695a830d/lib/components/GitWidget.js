"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const ReactDOM = require("react-dom");
const widgets_1 = require("@phosphor/widgets");
const signaling_1 = require("@phosphor/signaling");
const GitPanel_1 = require("./GitPanel");
const GitWidgetStyle_1 = require("../componentsStyle/GitWidgetStyle");
require("../../style/variables.css");
/**
 * The default implementation of `IRenderer`.
 */
class Renderer {
    createNode() {
        let node = document.createElement('div');
        node.id = 'GitSession-root';
        return node;
    }
}
exports.Renderer = Renderer;
/**
 * The default `Renderer` instance.
 */
exports.defaultRenderer = new Renderer();
/**
 * A class that exposes the git-plugin sessions.
 */
class GitWidget extends widgets_1.Widget {
    /**
     * Construct a new running widget.
     */
    constructor(app, options, diffFunction) {
        super({
            node: (options.renderer || exports.defaultRenderer).createNode()
        });
        this._renderer = null;
        this._refreshId = -1;
        this._refreshed = new signaling_1.Signal(this);
        this.addClass(GitWidgetStyle_1.gitWidgetStyle);
        const element = React.createElement(GitPanel_1.GitPanel, { app: app, diff: diffFunction });
        this.component = ReactDOM.render(element, this.node);
        this.component.refresh();
    }
    /**
     * Override widget's default show() to
     * refresh content every time Git widget is shown.
     */
    show() {
        super.show();
        this.component.refresh();
    }
    /**
     * The renderer used by the running sessions widget.
     */
    get renderer() {
        return this._renderer;
    }
    /**
     * A signal emitted when the directory listing is refreshed.
     */
    get refreshed() {
        return this._refreshed;
    }
    /**
     * Get the input text node.
     */
    get inputNode() {
        return this.node.getElementsByTagName('input')[0];
    }
    /**
     * Dispose of the resources used by the widget.
     */
    dispose() {
        this._renderer = null;
        clearTimeout(this._refreshId);
        super.dispose();
    }
    /**
     * Handle the DOM events for the widget.
     *
     * @param event - The DOM event sent to the widget.
     *
     * #### Notes
     * This method implements the DOM `EventListener` interface and is
     * called in response to events on the widget's DOM nodes. It should
     * not be called directly by user code.
     */
    handleEvent(event) {
        switch (event.type) {
            case 'change':
                this._evtChange(event);
                break;
            case 'click':
                this._evtClick(event);
                break;
            case 'dblclick':
                this._evtDblClick(event);
                break;
            default:
                break;
        }
    }
    /**
     * A message handler invoked on an `'after-attach'` message.
     */
    onAfterAttach(msg) {
        this.node.addEventListener('change', this);
        this.node.addEventListener('click', this);
        this.node.addEventListener('dblclick', this);
    }
    /**
     * A message handler invoked on a `'before-detach'` message.
     */
    onBeforeDetach(msg) {
        this.node.addEventListener('change', this);
        this.node.removeEventListener('click', this);
        this.node.removeEventListener('dblclick', this);
    }
    /**
     * Handle the `'click'` event for the widget.
     *
     * #### Notes
     * This listener is attached to the document node.
     */
    _evtChange(event) { }
    /**
     * Handle the `'click'` event for the widget.
     *
     * #### Notes
     * This listener is attached to the document node.
     */
    _evtClick(event) { }
    /**
     * Handle the `'dblclick'` event for the widget.
     */
    _evtDblClick(event) { }
}
exports.GitWidget = GitWidget;
