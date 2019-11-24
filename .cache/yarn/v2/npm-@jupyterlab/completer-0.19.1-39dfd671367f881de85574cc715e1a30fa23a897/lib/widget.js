"use strict";
// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
Object.defineProperty(exports, "__esModule", { value: true });
const algorithm_1 = require("@phosphor/algorithm");
const coreutils_1 = require("@phosphor/coreutils");
const domutils_1 = require("@phosphor/domutils");
const signaling_1 = require("@phosphor/signaling");
const widgets_1 = require("@phosphor/widgets");
const apputils_1 = require("@jupyterlab/apputils");
/**
 * The class name added to completer menu items.
 */
const ITEM_CLASS = 'jp-Completer-item';
/**
 * The class name added to an active completer menu item.
 */
const ACTIVE_CLASS = 'jp-mod-active';
/**
 * The minimum height of a completer widget.
 */
const MIN_HEIGHT = 20;
/**
 * The maximum height of a completer widget.
 */
const MAX_HEIGHT = 200;
/**
 * A flag to indicate that event handlers are caught in the capture phase.
 */
const USE_CAPTURE = true;
/**
 * The number of colors defined for the completer type annotations.
 * These are listed in completer/style/index.css#102-152.
 */
const N_COLORS = 10;
/**
 * A widget that enables text completion.
 */
class Completer extends widgets_1.Widget {
    /**
     * Construct a text completer menu widget.
     */
    constructor(options) {
        super({ node: document.createElement('ul') });
        this._activeIndex = 0;
        this._editor = null;
        this._model = null;
        this._renderer = null;
        this._resetFlag = false;
        this._selected = new signaling_1.Signal(this);
        this._visibilityChanged = new signaling_1.Signal(this);
        this._renderer = options.renderer || Completer.defaultRenderer;
        this.model = options.model || null;
        this.editor = options.editor || null;
        this.addClass('jp-Completer');
    }
    /**
     * The editor used by the completion widget.
     */
    get editor() {
        return this._editor;
    }
    set editor(newValue) {
        this._editor = newValue;
    }
    /**
     * A signal emitted when a selection is made from the completer menu.
     */
    get selected() {
        return this._selected;
    }
    /**
     * A signal emitted when the completer widget's visibility changes.
     *
     * #### Notes
     * This signal is useful when there are multiple floating widgets that may
     * contend with the same space and ought to be mutually exclusive.
     */
    get visibilityChanged() {
        return this._visibilityChanged;
    }
    /**
     * The model used by the completer widget.
     */
    get model() {
        return this._model;
    }
    set model(model) {
        if ((!model && !this._model) || model === this._model) {
            return;
        }
        if (this._model) {
            this._model.stateChanged.disconnect(this.onModelStateChanged, this);
        }
        this._model = model;
        if (this._model) {
            this._model.stateChanged.connect(this.onModelStateChanged, this);
        }
    }
    /**
     * Dispose of the resources held by the completer widget.
     */
    dispose() {
        this._model = null;
        super.dispose();
    }
    /**
     * Handle the DOM events for the widget.
     *
     * @param event - The DOM event sent to the widget.
     *
     * #### Notes
     * This method implements the DOM `EventListener` interface and is
     * called in response to events on the dock panel's node. It should
     * not be called directly by user code.
     */
    handleEvent(event) {
        if (this.isHidden || !this._editor) {
            return;
        }
        switch (event.type) {
            case 'keydown':
                this._evtKeydown(event);
                break;
            case 'mousedown':
                this._evtMousedown(event);
                break;
            case 'scroll':
                this._evtScroll(event);
                break;
            default:
                break;
        }
    }
    /**
     * Reset the widget.
     */
    reset() {
        this._activeIndex = 0;
        if (this._model) {
            this._model.reset(true);
        }
    }
    /**
     * Emit the selected signal for the current active item and reset.
     */
    selectActive() {
        let active = this.node.querySelector(`.${ACTIVE_CLASS}`);
        if (!active) {
            this.reset();
            return;
        }
        this._selected.emit(active.getAttribute('data-value'));
        this.reset();
    }
    /**
     * Handle `after-attach` messages for the widget.
     */
    onAfterAttach(msg) {
        document.addEventListener('keydown', this, USE_CAPTURE);
        document.addEventListener('mousedown', this, USE_CAPTURE);
        document.addEventListener('scroll', this, USE_CAPTURE);
    }
    /**
     * Handle `before-detach` messages for the widget.
     */
    onBeforeDetach(msg) {
        document.removeEventListener('keydown', this, USE_CAPTURE);
        document.removeEventListener('mousedown', this, USE_CAPTURE);
        document.removeEventListener('scroll', this, USE_CAPTURE);
    }
    /**
     * Handle model state changes.
     */
    onModelStateChanged() {
        if (this.isAttached) {
            this._activeIndex = 0;
            this.update();
        }
    }
    /**
     * Handle `update-request` messages.
     */
    onUpdateRequest(msg) {
        const model = this._model;
        if (!model) {
            return;
        }
        if (this._resetFlag) {
            this._resetFlag = false;
            if (!this.isHidden) {
                this.hide();
                this._visibilityChanged.emit(undefined);
            }
            return;
        }
        let items = algorithm_1.toArray(model.items());
        // If there are no items, reset and bail.
        if (!items || !items.length) {
            this._resetFlag = true;
            this.reset();
            if (!this.isHidden) {
                this.hide();
                this._visibilityChanged.emit(undefined);
            }
            return;
        }
        // If there is only one item, signal and bail.
        if (items.length === 1) {
            this._selected.emit(items[0].raw);
            this.reset();
            return;
        }
        // Clear the node.
        let node = this.node;
        node.textContent = '';
        // Compute an ordered list of all the types in the typeMap, this is computed
        // once by the model each time new data arrives for efficiency.
        let orderedTypes = model.orderedTypes();
        // Populate the completer items.
        for (let item of items) {
            let li = this._renderer.createItemNode(item, model.typeMap(), orderedTypes);
            node.appendChild(li);
        }
        let active = node.querySelectorAll(`.${ITEM_CLASS}`)[this._activeIndex];
        active.classList.add(ACTIVE_CLASS);
        // If this is the first time the current completer session has loaded,
        // populate any initial subset match.
        if (model.subsetMatch) {
            const populated = this._populateSubset();
            model.subsetMatch = false;
            if (populated) {
                this.update();
                return;
            }
        }
        if (this.isHidden) {
            this.show();
            this._setGeometry();
            this._visibilityChanged.emit(undefined);
        }
        else {
            this._setGeometry();
        }
    }
    /**
     * Cycle through the available completer items.
     *
     * #### Notes
     * When the user cycles all the way `down` to the last index, subsequent
     * `down` cycles will remain on the last index. When the user cycles `up` to
     * the first item, subsequent `up` cycles will remain on the first cycle.
     */
    _cycle(direction) {
        let items = this.node.querySelectorAll(`.${ITEM_CLASS}`);
        let index = this._activeIndex;
        let active = this.node.querySelector(`.${ACTIVE_CLASS}`);
        active.classList.remove(ACTIVE_CLASS);
        if (direction === 'up') {
            this._activeIndex = index === 0 ? index : index - 1;
        }
        else {
            this._activeIndex = index < items.length - 1 ? index + 1 : index;
        }
        active = items[this._activeIndex];
        active.classList.add(ACTIVE_CLASS);
        domutils_1.ElementExt.scrollIntoViewIfNeeded(this.node, active);
    }
    /**
     * Handle keydown events for the widget.
     */
    _evtKeydown(event) {
        if (this.isHidden || !this._editor) {
            return;
        }
        if (!this._editor.host.contains(event.target)) {
            this.reset();
            return;
        }
        switch (event.keyCode) {
            case 9: // Tab key
                event.preventDefault();
                event.stopPropagation();
                event.stopImmediatePropagation();
                let model = this._model;
                if (!model) {
                    return;
                }
                model.subsetMatch = true;
                let populated = this._populateSubset();
                model.subsetMatch = false;
                if (populated) {
                    return;
                }
                this.selectActive();
                return;
            case 27: // Esc key
                event.preventDefault();
                event.stopPropagation();
                event.stopImmediatePropagation();
                this.reset();
                return;
            case 38: // Up arrow key
            case 40: // Down arrow key
                event.preventDefault();
                event.stopPropagation();
                event.stopImmediatePropagation();
                this._cycle(event.keyCode === 38 ? 'up' : 'down');
                return;
            default:
                return;
        }
    }
    /**
     * Handle mousedown events for the widget.
     */
    _evtMousedown(event) {
        if (this.isHidden || !this._editor) {
            return;
        }
        if (Private.nonstandardClick(event)) {
            this.reset();
            return;
        }
        let target = event.target;
        while (target !== document.documentElement) {
            // If the user has made a selection, emit its value and reset the widget.
            if (target.classList.contains(ITEM_CLASS)) {
                event.preventDefault();
                event.stopPropagation();
                event.stopImmediatePropagation();
                this._selected.emit(target.getAttribute('data-value'));
                this.reset();
                return;
            }
            // If the mouse event happened anywhere else in the widget, bail.
            if (target === this.node) {
                event.preventDefault();
                event.stopPropagation();
                event.stopImmediatePropagation();
                return;
            }
            target = target.parentElement;
        }
        this.reset();
    }
    /**
     * Handle scroll events for the widget
     */
    _evtScroll(event) {
        if (this.isHidden || !this._editor) {
            return;
        }
        const { node } = this;
        // All scrolls except scrolls in the actual hover box node may cause the
        // referent editor that anchors the node to move, so the only scroll events
        // that can safely be ignored are ones that happen inside the hovering node.
        if (node.contains(event.target)) {
            return;
        }
        // Set the geometry of the node asynchronously.
        requestAnimationFrame(() => {
            this._setGeometry();
        });
    }
    /**
     * Populate the completer up to the longest initial subset of items.
     *
     * @returns `true` if a subset match was found and populated.
     */
    _populateSubset() {
        const { model } = this;
        if (!model) {
            return false;
        }
        const items = this.node.querySelectorAll(`.${ITEM_CLASS}`);
        const subset = Private.commonSubset(Private.itemValues(items));
        const { query } = model;
        // If a common subset exists and it is not the current query, highlight it.
        if (subset && subset !== query && subset.indexOf(query) === 0) {
            model.query = subset;
            return true;
        }
        return false;
    }
    /**
     * Set the visible dimensions of the widget.
     */
    _setGeometry() {
        const { node } = this;
        const model = this._model;
        const editor = this._editor;
        // This is an overly defensive test: `cursor` will always exist if
        // `original` exists, except in contrived tests. But since it is possible
        // to generate a runtime error, the check occurs here.
        if (!editor || !model || !model.original || !model.cursor) {
            return;
        }
        const start = model.cursor.start;
        const position = editor.getPositionAt(start);
        const anchor = editor.getCoordinateForPosition(position);
        const style = window.getComputedStyle(node);
        const borderLeft = parseInt(style.borderLeftWidth, 10) || 0;
        const paddingLeft = parseInt(style.paddingLeft, 10) || 0;
        // Calculate the geometry of the completer.
        apputils_1.HoverBox.setGeometry({
            anchor,
            host: editor.host,
            maxHeight: MAX_HEIGHT,
            minHeight: MIN_HEIGHT,
            node: node,
            offset: { horizontal: borderLeft + paddingLeft },
            privilege: 'below',
            style: style
        });
    }
}
exports.Completer = Completer;
(function (Completer) {
    /**
     * The default implementation of an `IRenderer`.
     */
    class Renderer {
        /**
         * Create an item node for a text completer menu.
         */
        createItemNode(item, typeMap, orderedTypes) {
            let li = document.createElement('li');
            li.className = ITEM_CLASS;
            // Set the raw, un-marked up value as a data attribute.
            li.setAttribute('data-value', item.raw);
            let matchNode = document.createElement('code');
            matchNode.className = 'jp-Completer-match';
            // Use innerHTML because search results include <mark> tags.
            matchNode.innerHTML = apputils_1.defaultSanitizer.sanitize(item.text, {
                allowedTags: ['mark']
            });
            // If there are types provided add those.
            if (!coreutils_1.JSONExt.deepEqual(typeMap, {})) {
                let typeNode = document.createElement('span');
                let type = typeMap[item.raw] || '';
                typeNode.textContent = (type[0] || '').toLowerCase();
                let colorIndex = (orderedTypes.indexOf(type) % N_COLORS) + 1;
                typeNode.className = 'jp-Completer-type';
                typeNode.setAttribute(`data-color-index`, colorIndex.toString());
                li.title = type;
                let typeExtendedNode = document.createElement('code');
                typeExtendedNode.className = 'jp-Completer-typeExtended';
                typeExtendedNode.textContent = type.toLocaleLowerCase();
                li.appendChild(typeNode);
                li.appendChild(matchNode);
                li.appendChild(typeExtendedNode);
            }
            else {
                li.appendChild(matchNode);
            }
            return li;
        }
    }
    Completer.Renderer = Renderer;
    /**
     * The default `IRenderer` instance.
     */
    Completer.defaultRenderer = new Renderer();
})(Completer = exports.Completer || (exports.Completer = {}));
/**
 * A namespace for completer widget private data.
 */
var Private;
(function (Private) {
    /**
     * Returns the common subset string that a list of strings shares.
     */
    function commonSubset(values) {
        let len = values.length;
        let subset = '';
        if (len < 2) {
            return subset;
        }
        let strlen = values[0].length;
        for (let i = 0; i < strlen; i++) {
            let ch = values[0][i];
            for (let j = 1; j < len; j++) {
                if (values[j][i] !== ch) {
                    return subset;
                }
            }
            subset += ch;
        }
        return subset;
    }
    Private.commonSubset = commonSubset;
    /**
     * Returns the list of raw item values currently in the DOM.
     */
    function itemValues(items) {
        let values = [];
        for (let i = 0, len = items.length; i < len; i++) {
            values.push(items[i].getAttribute('data-value'));
        }
        return values;
    }
    Private.itemValues = itemValues;
    /**
     * Returns true for any modified click event (i.e., not a left-click).
     */
    function nonstandardClick(event) {
        return (event.button !== 0 ||
            event.altKey ||
            event.ctrlKey ||
            event.shiftKey ||
            event.metaKey);
    }
    Private.nonstandardClick = nonstandardClick;
})(Private || (Private = {}));
