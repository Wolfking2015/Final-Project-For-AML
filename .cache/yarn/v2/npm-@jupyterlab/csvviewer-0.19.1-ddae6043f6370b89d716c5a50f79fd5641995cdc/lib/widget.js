"use strict";
// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
const coreutils_1 = require("@jupyterlab/coreutils");
const docregistry_1 = require("@jupyterlab/docregistry");
const coreutils_2 = require("@phosphor/coreutils");
const datagrid_1 = require("@phosphor/datagrid");
const widgets_1 = require("@phosphor/widgets");
const toolbar_1 = require("./toolbar");
const model_1 = require("./model");
/**
 * The class name added to a CSV viewer.
 */
const CSV_CLASS = 'jp-CSVViewer';
/**
 * The class name added to a CSV viewer datagrid.
 */
const CSV_GRID_CLASS = 'jp-CSVViewer-grid';
/**
 * The timeout to wait for change activity to have ceased before rendering.
 */
const RENDER_TIMEOUT = 1000;
/**
 * A viewer for CSV tables.
 */
class CSVViewer extends widgets_1.Widget {
    /**
     * Construct a new CSV viewer.
     */
    constructor(options) {
        super();
        this._monitor = null;
        this._delimiter = ',';
        this._revealed = new coreutils_2.PromiseDelegate();
        let context = (this._context = options.context);
        let layout = (this.layout = new widgets_1.PanelLayout());
        this.addClass(CSV_CLASS);
        this._grid = new datagrid_1.DataGrid({
            baseRowSize: 24,
            baseColumnSize: 144,
            baseColumnHeaderSize: 36,
            baseRowHeaderSize: 64
        });
        this._grid.addClass(CSV_GRID_CLASS);
        this._grid.headerVisibility = 'all';
        layout.addWidget(this._grid);
        this._context.ready.then(() => {
            this._updateGrid();
            this._revealed.resolve(undefined);
            // Throttle the rendering rate of the widget.
            this._monitor = new coreutils_1.ActivityMonitor({
                signal: context.model.contentChanged,
                timeout: RENDER_TIMEOUT
            });
            this._monitor.activityStopped.connect(this._updateGrid, this);
        });
    }
    /**
     * The CSV widget's context.
     */
    get context() {
        return this._context;
    }
    /**
     * A promise that resolves when the csv viewer is ready to be revealed.
     */
    get revealed() {
        return this._revealed.promise;
    }
    /**
     * The delimiter for the file.
     */
    get delimiter() {
        return this._delimiter;
    }
    set delimiter(value) {
        if (value === this._delimiter) {
            return;
        }
        this._delimiter = value;
        this._updateGrid();
    }
    /**
     * The style used by the data grid.
     */
    get style() {
        return this._grid.style;
    }
    set style(value) {
        this._grid.style = value;
    }
    /**
     * The text renderer used by the data grid.
     */
    get renderer() {
        return this._grid.defaultRenderer;
    }
    set renderer(value) {
        this._grid.defaultRenderer = value;
    }
    /**
     * Dispose of the resources used by the widget.
     */
    dispose() {
        if (this._monitor) {
            this._monitor.dispose();
        }
        super.dispose();
    }
    /**
     * Handle `'activate-request'` messages.
     */
    onActivateRequest(msg) {
        this.node.tabIndex = -1;
        this.node.focus();
    }
    /**
     * Create the model for the grid.
     */
    _updateGrid() {
        let data = this._context.model.toString();
        let delimiter = this._delimiter;
        let oldModel = this._grid.model;
        this._grid.model = new model_1.DSVModel({ data, delimiter });
        if (oldModel) {
            oldModel.dispose();
        }
    }
}
exports.CSVViewer = CSVViewer;
/**
 * A document widget for CSV content widgets.
 */
class CSVDocumentWidget extends docregistry_1.DocumentWidget {
    constructor(options) {
        let { content, context, delimiter, reveal } = options, other = __rest(options, ["content", "context", "delimiter", "reveal"]);
        content = content || Private.createContent(context);
        reveal = Promise.all([reveal, content.revealed]);
        super(Object.assign({ content, context, reveal }, other));
        if (delimiter) {
            content.delimiter = delimiter;
        }
        const csvDelimiter = new toolbar_1.CSVDelimiter({ selected: content.delimiter });
        this.toolbar.addItem('delimiter', csvDelimiter);
        csvDelimiter.delimiterChanged.connect((sender, delimiter) => {
            content.delimiter = delimiter;
        });
    }
}
exports.CSVDocumentWidget = CSVDocumentWidget;
var Private;
(function (Private) {
    function createContent(context) {
        return new CSVViewer({ context });
    }
    Private.createContent = createContent;
})(Private || (Private = {}));
/**
 * A widget factory for CSV widgets.
 */
class CSVViewerFactory extends docregistry_1.ABCWidgetFactory {
    /**
     * Create a new widget given a context.
     */
    createNewWidget(context) {
        return new CSVDocumentWidget({ context });
    }
}
exports.CSVViewerFactory = CSVViewerFactory;
/**
 * A widget factory for TSV widgets.
 */
class TSVViewerFactory extends docregistry_1.ABCWidgetFactory {
    /**
     * Create a new widget given a context.
     */
    createNewWidget(context) {
        const delimiter = '\t';
        return new CSVDocumentWidget({ context, delimiter });
    }
}
exports.TSVViewerFactory = TSVViewerFactory;
