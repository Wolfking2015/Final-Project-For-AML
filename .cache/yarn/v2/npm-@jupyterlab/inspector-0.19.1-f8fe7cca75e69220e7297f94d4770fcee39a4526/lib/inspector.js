"use strict";
// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
Object.defineProperty(exports, "__esModule", { value: true });
const apputils_1 = require("@jupyterlab/apputils");
const coreutils_1 = require("@phosphor/coreutils");
const disposable_1 = require("@phosphor/disposable");
const widgets_1 = require("@phosphor/widgets");
/**
 * The class name added to inspector panels.
 */
const PANEL_CLASS = 'jp-Inspector';
/**
 * The class name added to inspector child item widgets.
 */
const ITEM_CLASS = 'jp-InspectorItem';
/**
 * The class name added to inspector child item widgets' content.
 */
const CONTENT_CLASS = 'jp-InspectorItem-content';
/**
 * The history clear button class name.
 */
const CLEAR_CLASS = 'jp-InspectorItem-clear';
/**
 * The back button class name.
 */
const BACK_CLASS = 'jp-InspectorItem-back';
/**
 * The forward button class name.
 */
const FORWARD_CLASS = 'jp-InspectorItem-forward';
/* tslint:disable */
/**
 * The inspector panel token.
 */
exports.IInspector = new coreutils_1.Token('@jupyterlab/inspector:IInspector');
/**
 * A panel which contains a set of inspectors.
 */
class InspectorPanel extends widgets_1.TabPanel {
    /**
     * Construct an inspector.
     */
    constructor() {
        super();
        this._items = Object.create(null);
        this._source = null;
        this.addClass(PANEL_CLASS);
    }
    /**
     * The source of events the inspector panel listens for.
     */
    get source() {
        return this._source;
    }
    set source(source) {
        if (this._source === source) {
            return;
        }
        // Disconnect old signal handler.
        if (this._source) {
            this._source.standby = true;
            this._source.inspected.disconnect(this.onInspectorUpdate, this);
            this._source.disposed.disconnect(this.onSourceDisposed, this);
        }
        // Clear the inspector child items (but maintain history) if necessary.
        Object.keys(this._items).forEach(i => {
            this._items[i].content = null;
        });
        this._source = source;
        // Connect new signal handler.
        if (this._source) {
            this._source.standby = false;
            this._source.inspected.connect(this.onInspectorUpdate, this);
            this._source.disposed.connect(this.onSourceDisposed, this);
        }
    }
    /**
     * Create an inspector child item and return a disposable to remove it.
     *
     * @param item - The inspector child item being added to the inspector.
     *
     * @returns A disposable that removes the child item from the inspector.
     */
    add(item) {
        const widget = new InspectorItem();
        widget.rank = item.rank;
        widget.remembers = !!item.remembers;
        widget.title.closable = false;
        widget.title.label = item.name;
        if (item.className) {
            widget.addClass(item.className);
        }
        this._items[item.type] = widget;
        this.addWidget(widget);
        if (Object.keys(this._items).length < 2) {
            this.tabBar.hide();
        }
        else {
            this.tabBar.show();
        }
        return new disposable_1.DisposableDelegate(() => {
            if (widget.isDisposed || this.isDisposed) {
                return;
            }
            widget.dispose();
            delete this._items[item.type];
            if (Object.keys(this._items).length < 2) {
                this.tabBar.hide();
            }
            else {
                this.tabBar.show();
            }
        });
    }
    /**
     * Dispose of the resources held by the widget.
     */
    dispose() {
        if (this.isDisposed) {
            return;
        }
        this.source = null;
        let items = this._items;
        // Dispose the inspector child items.
        Object.keys(items).forEach(i => {
            items[i].dispose();
        });
        super.dispose();
    }
    /**
     * Handle inspector update signals.
     */
    onInspectorUpdate(sender, args) {
        let widget = this._items[args.type];
        if (!widget) {
            return;
        }
        // Update the content of the inspector widget.
        widget.content = args.content;
        let items = this._items;
        // If any inspector with a higher rank has content, do not change focus.
        if (args.content) {
            for (let type in items) {
                let inspector = this._items[type];
                if (inspector.rank < widget.rank && inspector.content) {
                    return;
                }
            }
            this.currentWidget = widget;
            return;
        }
        // If the inspector was emptied, show the next best ranked inspector.
        let lowest = Infinity;
        let newWidget = null;
        for (let type in items) {
            let inspector = this._items[type];
            if (inspector.rank < lowest && inspector.content) {
                lowest = inspector.rank;
                newWidget = inspector;
            }
        }
        if (newWidget) {
            this.currentWidget = newWidget;
        }
    }
    /**
     * Handle source disposed signals.
     */
    onSourceDisposed(sender, args) {
        this.source = null;
    }
}
exports.InspectorPanel = InspectorPanel;
/**
 * A code inspector child widget.
 */
class InspectorItem extends widgets_1.Widget {
    /**
     * Construct an inspector widget.
     */
    constructor() {
        super();
        this._content = null;
        this._history = [];
        this._index = -1;
        this._rank = Infinity;
        this._remembers = false;
        this.layout = new widgets_1.PanelLayout();
        this.addClass(ITEM_CLASS);
        this._toolbar = this._createToolbar();
        this.layout.addWidget(this._toolbar);
    }
    /**
     * The text of the inspector.
     */
    get content() {
        return this._content;
    }
    set content(newValue) {
        if (newValue === this._content) {
            return;
        }
        if (this._content) {
            if (this._remembers) {
                this._content.hide();
            }
            else {
                this._content.dispose();
            }
        }
        this._content = newValue;
        if (newValue) {
            newValue.addClass(CONTENT_CLASS);
            this.layout.addWidget(newValue);
            if (this.remembers) {
                this._history.push(newValue);
                this._index++;
            }
        }
    }
    /**
     * A flag that indicates whether the inspector remembers history.
     */
    get remembers() {
        return this._remembers;
    }
    set remembers(newValue) {
        if (newValue === this._remembers) {
            return;
        }
        this._remembers = newValue;
        if (!newValue) {
            this._clear();
        }
        this.update();
    }
    /**
     * The display rank of the inspector.
     */
    get rank() {
        return this._rank;
    }
    set rank(newValue) {
        this._rank = newValue;
    }
    /**
     * Dispose of the resources held by the widget.
     */
    dispose() {
        if (this.isDisposed) {
            return;
        }
        this._history.forEach(widget => widget.dispose());
        this._toolbar.dispose();
        super.dispose();
    }
    /**
     * Navigate back in history.
     */
    _back() {
        if (this._history.length) {
            this._navigateTo(Math.max(this._index - 1, 0));
        }
    }
    /**
     * Clear history.
     */
    _clear() {
        this._history.forEach(widget => widget.dispose());
        this._history = [];
        this._index = -1;
    }
    /**
     * Navigate forward in history.
     */
    _forward() {
        if (this._history.length) {
            this._navigateTo(Math.min(this._index + 1, this._history.length - 1));
        }
    }
    /**
     * Create a history toolbar.
     */
    _createToolbar() {
        let toolbar = new apputils_1.Toolbar();
        if (!this._remembers) {
            return toolbar;
        }
        let clear = new apputils_1.ToolbarButton({
            iconClassName: CLEAR_CLASS + ' jp-Icon jp-Icon-16',
            onClick: () => {
                this._clear();
            },
            tooltip: 'Clear history.'
        });
        toolbar.addItem('clear', clear);
        let back = new apputils_1.ToolbarButton({
            iconClassName: BACK_CLASS + ' jp-Icon jp-Icon-16',
            onClick: () => {
                this._back();
            },
            tooltip: 'Navigate back in history.'
        });
        toolbar.addItem('back', back);
        let forward = new apputils_1.ToolbarButton({
            iconClassName: FORWARD_CLASS + ' jp-Icon jp-Icon-16',
            onClick: () => {
                this._forward();
            },
            tooltip: 'Navigate forward in history.'
        });
        toolbar.addItem('forward', forward);
        return toolbar;
    }
    /**
     * Navigate to a known index in history.
     */
    _navigateTo(index) {
        if (this._content) {
            this._content.hide();
        }
        this._content = this._history[index];
        this._index = index;
        this._content.show();
    }
}
