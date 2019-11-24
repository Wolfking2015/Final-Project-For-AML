import { ABCWidgetFactory, DocumentRegistry, IDocumentWidget, DocumentWidget } from '@jupyterlab/docregistry';
import { DataGrid, TextRenderer } from '@phosphor/datagrid';
import { Message } from '@phosphor/messaging';
import { Widget } from '@phosphor/widgets';
/**
 * A viewer for CSV tables.
 */
export declare class CSVViewer extends Widget {
    /**
     * Construct a new CSV viewer.
     */
    constructor(options: CSVViewer.IOptions);
    /**
     * The CSV widget's context.
     */
    readonly context: DocumentRegistry.Context;
    /**
     * A promise that resolves when the csv viewer is ready to be revealed.
     */
    readonly revealed: Promise<void>;
    /**
     * The delimiter for the file.
     */
    delimiter: string;
    /**
     * The style used by the data grid.
     */
    style: DataGrid.IStyle;
    /**
     * The text renderer used by the data grid.
     */
    renderer: TextRenderer;
    /**
     * Dispose of the resources used by the widget.
     */
    dispose(): void;
    /**
     * Handle `'activate-request'` messages.
     */
    protected onActivateRequest(msg: Message): void;
    /**
     * Create the model for the grid.
     */
    private _updateGrid;
    private _context;
    private _grid;
    private _monitor;
    private _delimiter;
    private _revealed;
}
/**
 * A namespace for `CSVViewer` statics.
 */
export declare namespace CSVViewer {
    /**
     * Instantiation options for CSV widgets.
     */
    interface IOptions {
        /**
         * The document context for the CSV being rendered by the widget.
         */
        context: DocumentRegistry.Context;
    }
}
/**
 * A document widget for CSV content widgets.
 */
export declare class CSVDocumentWidget extends DocumentWidget<CSVViewer> {
    constructor(options: CSVDocumentWidget.IOptions);
}
export declare namespace CSVDocumentWidget {
    interface IOptions extends DocumentWidget.IOptionsOptionalContent<CSVViewer> {
        delimiter?: string;
    }
}
/**
 * A widget factory for CSV widgets.
 */
export declare class CSVViewerFactory extends ABCWidgetFactory<IDocumentWidget<CSVViewer>> {
    /**
     * Create a new widget given a context.
     */
    protected createNewWidget(context: DocumentRegistry.Context): IDocumentWidget<CSVViewer>;
}
/**
 * A widget factory for TSV widgets.
 */
export declare class TSVViewerFactory extends ABCWidgetFactory<IDocumentWidget<CSVViewer>> {
    /**
     * Create a new widget given a context.
     */
    protected createNewWidget(context: DocumentRegistry.Context): IDocumentWidget<CSVViewer>;
}
