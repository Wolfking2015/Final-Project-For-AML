"use strict";
// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
Object.defineProperty(exports, "__esModule", { value: true });
const application_1 = require("@jupyterlab/application");
const apputils_1 = require("@jupyterlab/apputils");
const csvviewer_1 = require("@jupyterlab/csvviewer");
const datagrid_1 = require("@phosphor/datagrid");
/**
 * The name of the factories that creates widgets.
 */
const FACTORY_CSV = 'CSVTable';
const FACTORY_TSV = 'TSVTable';
/**
 * The CSV file handler extension.
 */
const csv = {
    activate: activateCsv,
    id: '@jupyterlab/csvviewer-extension:csv',
    requires: [application_1.ILayoutRestorer, apputils_1.IThemeManager],
    autoStart: true
};
/**
 * The TSV file handler extension.
 */
const tsv = {
    activate: activateTsv,
    id: '@jupyterlab/csvviewer-extension:tsv',
    requires: [application_1.ILayoutRestorer, apputils_1.IThemeManager],
    autoStart: true
};
/**
 * Activate cssviewer extension for CSV files
 */
function activateCsv(app, restorer, themeManager) {
    const factory = new csvviewer_1.CSVViewerFactory({
        name: FACTORY_CSV,
        fileTypes: ['csv'],
        defaultFor: ['csv'],
        readOnly: true
    });
    const tracker = new apputils_1.InstanceTracker({
        namespace: 'csvviewer'
    });
    // The current styles for the data grids.
    let style = Private.LIGHT_STYLE;
    let renderer = Private.LIGHT_RENDERER;
    // Handle state restoration.
    restorer.restore(tracker, {
        command: 'docmanager:open',
        args: widget => ({ path: widget.context.path, factory: FACTORY_CSV }),
        name: widget => widget.context.path
    });
    app.docRegistry.addWidgetFactory(factory);
    let ft = app.docRegistry.getFileType('csv');
    factory.widgetCreated.connect((sender, widget) => {
        // Track the widget.
        tracker.add(widget);
        // Notify the instance tracker if restore data needs to update.
        widget.context.pathChanged.connect(() => {
            tracker.save(widget);
        });
        if (ft) {
            widget.title.iconClass = ft.iconClass;
            widget.title.iconLabel = ft.iconLabel;
        }
        // Set the theme for the new widget.
        widget.content.style = style;
        widget.content.renderer = renderer;
    });
    // Keep the themes up-to-date.
    const updateThemes = () => {
        const isLight = themeManager.isLight(themeManager.theme);
        style = isLight ? Private.LIGHT_STYLE : Private.DARK_STYLE;
        renderer = isLight ? Private.LIGHT_RENDERER : Private.DARK_RENDERER;
        tracker.forEach(grid => {
            grid.content.style = style;
            grid.content.renderer = renderer;
        });
    };
    themeManager.themeChanged.connect(updateThemes);
}
/**
 * Activate cssviewer extension for TSV files
 */
function activateTsv(app, restorer, themeManager) {
    const factory = new csvviewer_1.TSVViewerFactory({
        name: FACTORY_TSV,
        fileTypes: ['tsv'],
        defaultFor: ['tsv'],
        readOnly: true
    });
    const tracker = new apputils_1.InstanceTracker({
        namespace: 'tsvviewer'
    });
    // The current styles for the data grids.
    let style = Private.LIGHT_STYLE;
    let renderer = Private.LIGHT_RENDERER;
    // Handle state restoration.
    restorer.restore(tracker, {
        command: 'docmanager:open',
        args: widget => ({ path: widget.context.path, factory: FACTORY_TSV }),
        name: widget => widget.context.path
    });
    app.docRegistry.addWidgetFactory(factory);
    let ft = app.docRegistry.getFileType('tsv');
    factory.widgetCreated.connect((sender, widget) => {
        // Track the widget.
        tracker.add(widget);
        // Notify the instance tracker if restore data needs to update.
        widget.context.pathChanged.connect(() => {
            tracker.save(widget);
        });
        if (ft) {
            widget.title.iconClass = ft.iconClass;
            widget.title.iconLabel = ft.iconLabel;
        }
        // Set the theme for the new widget.
        widget.content.style = style;
        widget.content.renderer = renderer;
    });
    // Keep the themes up-to-date.
    const updateThemes = () => {
        const isLight = themeManager.isLight(themeManager.theme);
        style = isLight ? Private.LIGHT_STYLE : Private.DARK_STYLE;
        renderer = isLight ? Private.LIGHT_RENDERER : Private.DARK_RENDERER;
        tracker.forEach(grid => {
            grid.content.style = style;
            grid.content.renderer = renderer;
        });
    };
    themeManager.themeChanged.connect(updateThemes);
}
/**
 * Export the plugins as default.
 */
const plugins = [csv, tsv];
exports.default = plugins;
/**
 * A namespace for private data.
 */
var Private;
(function (Private) {
    /**
     * The light theme for the data grid.
     */
    Private.LIGHT_STYLE = Object.assign({}, datagrid_1.DataGrid.defaultStyle, { voidColor: '#F3F3F3', backgroundColor: 'white', headerBackgroundColor: '#EEEEEE', gridLineColor: 'rgba(20, 20, 20, 0.15)', headerGridLineColor: 'rgba(20, 20, 20, 0.25)', rowBackgroundColor: i => (i % 2 === 0 ? '#F5F5F5' : 'white') });
    /**
     * The dark theme for the data grid.
     */
    Private.DARK_STYLE = {
        voidColor: 'black',
        backgroundColor: '#111111',
        headerBackgroundColor: '#424242',
        gridLineColor: 'rgba(235, 235, 235, 0.15)',
        headerGridLineColor: 'rgba(235, 235, 235, 0.25)',
        rowBackgroundColor: i => (i % 2 === 0 ? '#212121' : '#111111')
    };
    /**
     * The light renderer for the data grid.
     */
    Private.LIGHT_RENDERER = new datagrid_1.TextRenderer({
        textColor: '#111111',
        horizontalAlignment: 'right'
    });
    /**
     * The dark renderer for the data grid.
     */
    Private.DARK_RENDERER = new datagrid_1.TextRenderer({
        textColor: '#F5F5F5',
        horizontalAlignment: 'right'
    });
})(Private || (Private = {}));
