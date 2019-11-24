import { IMessageHandler, Message } from '@phosphor/messaging';
import { Widget } from '@phosphor/widgets';
import { CellRenderer } from './cellrenderer';
import { DataModel } from './datamodel';
import { RendererMap } from './renderermap';
/**
 * A widget which implements a high-performance tabular data grid.
 *
 * #### Notes
 * A data grid is implemented as a composition of child widgets. These
 * child widgets are considered an implementation detail. Manipulating
 * the child widgets of a data grid directly is undefined behavior.
 *
 * This class is not designed to be subclassed.
 */
export declare class DataGrid extends Widget {
    /**
     * Construct a new data grid.
     *
     * @param options - The options for initializing the data grid.
     */
    constructor(options?: DataGrid.IOptions);
    /**
     * Dispose of the resources held by the widgets.
     */
    dispose(): void;
    /**
     * Get the data model for the data grid.
     */
    /**
    * Set the data model for the data grid.
    */
    model: DataModel | null;
    /**
     * Get the style for the data grid.
     */
    /**
    * Set the style for the data grid.
    */
    style: DataGrid.IStyle;
    /**
     * Get the cell renderer map for the data grid.
     */
    /**
    * Set the cell renderer map for the data grid.
    */
    cellRenderers: RendererMap;
    /**
     * Get the default cell renderer for the data grid.
     */
    /**
    * Set the default cell renderer for the data grid.
    */
    defaultRenderer: CellRenderer;
    /**
     * Get the header visibility for the data grid.
     */
    /**
    * Set the header visibility for the data grid.
    */
    headerVisibility: DataGrid.HeaderVisibility;
    /**
     * The scroll X offset of the viewport.
     */
    readonly scrollX: number;
    /**
     * The scroll Y offset of the viewport.
     */
    readonly scrollY: number;
    /**
     * The maximum scroll X position for the current grid dimensions.
     *
     * #### Notes
     * This value is `1px` less than the theoretical maximum to allow the
     * the right-most grid line to be clipped when the vertical scroll bar
     * is visible.
     */
    readonly maxScrollX: number;
    /**
     * The maximum scroll Y position for the current grid dimensions.
     *
     * #### Notes
     * This value is `1px` less than the theoretical maximum to allow the
     * the bottom-most grid line to be clipped when the horizontal scroll
     * bar is visible.
     */
    readonly maxScrollY: number;
    /**
     * The virtual width of the grid body.
     *
     * #### Notes
     * This value does not include the width of the row headers.
     */
    readonly bodyWidth: number;
    /**
     * The virtual height of the grid body.
     *
     * #### Notes
     * This value does not include the height of the column headers.
     */
    readonly bodyHeight: number;
    /**
     * The virtual width of the row headers.
     *
     * #### Notes
     * This will be `0` if the row headers are hidden.
     */
    readonly headerWidth: number;
    /**
     * The virtual height of the column headers.
     *
     * #### Notes
     * This will be `0` if the column headers are hidden.
     */
    readonly headerHeight: number;
    /**
     * The total virtual width of the grid.
     *
     * #### Notes
     * If the grid widget is sized larger than this width, a horizontal
     * scroll bar will not be shown.
     */
    readonly totalWidth: number;
    /**
     * The total virtual height of the grid.
     *
     * #### Notes
     * If the grid widget is sized larger than this height, a vertical
     * scroll bar will not be shown.
     */
    readonly totalHeight: number;
    /**
     * The width of the visible portion of the data grid.
     *
     * #### Notes
     * This value does not include the width of the scroll bar.
     */
    readonly viewportWidth: number;
    /**
     * The height of the visible portion of the data grid.
     *
     * #### Notes
     * This value does not include the height of the scroll bar.
     */
    readonly viewportHeight: number;
    /**
     * The width of the visible portion of the body cells.
     *
     * #### Notes
     * This value does not include the width of the row headers.
     */
    readonly pageWidth: number;
    /**
     * The height of the visible portion of the body cells.
     *
     * #### Notes
     * This value does not include the height of the column headers.
     */
    readonly pageHeight: number;
    /**
     * Get the base size of the body rows.
     *
     * #### Notes
     * This is the size of rows which have not been resized.
     */
    /**
    * Set the base size of the body rows.
    *
    * #### Notes
    * This is the size of rows which have not been resized.
    */
    baseRowSize: number;
    /**
     * Get the base size of the body columns.
     *
     * #### Notes
     * This is the size of columns which have not been resized.
     */
    /**
    * Set the base size of the body columns.
    *
    * #### Notes
    * This is the size of columns which have not been resized.
    */
    baseColumnSize: number;
    /**
     * Get the base size of the row headers.
     *
     * #### Notes
     * This is the size of row headers which have not been resized.
     */
    /**
    * Set the base size of the row headers.
    *
    * #### Notes
    * This is the size of row headers which have not been resized.
    */
    baseRowHeaderSize: number;
    /**
     * Get the base size of the column headers.
     *
     * #### Notes
     * This is the size of column headers which have not been resized.
     */
    /**
    * Set the base size of the column headers.
    *
    * #### Notes
    * This is the size of column headers which have not been resized.
    */
    baseColumnHeaderSize: number;
    /**
     * Get the size of a section in the data grid.
     *
     * @param area - The grid area for the section of interest.
     *
     * @param index - The index of the section of interest.
     *
     * @return The size of the section, or `-1` if `index` is invalid.
     */
    sectionSize(area: 'row' | 'column' | 'row-header' | 'column-header', index: number): number;
    /**
     * Resize a section in the data grid.
     *
     * @param area - The grid area for the section of interest.
     *
     * @param index - The index of the section of interest.
     *
     * @param size - The new size for the section.
     *
     * #### Notes
     * This is a no-op if `index` is invalid.
     */
    resizeSection(area: 'row' | 'column' | 'row-header' | 'column-header', index: number, size: number): void;
    /**
     * Reset sections in the data grid to their base size.
     *
     * @param area - The grid area for the sections of interest.
     */
    resetSections(area: 'row' | 'column' | 'row-header' | 'column-header'): void;
    /**
     * Scroll the viewport by one page.
     *
     * @param - The desired direction of the scroll.
     */
    scrollByPage(dir: 'up' | 'down' | 'left' | 'right'): void;
    /**
     * Scroll the viewport by one cell-aligned step.
     *
     * @param - The desired direction of the scroll.
     */
    scrollByStep(dir: 'up' | 'down' | 'left' | 'right'): void;
    /**
     * Scroll the viewport by the specified delta.
     *
     * @param dx - The scroll X delta, in pixels.
     *
     * @param dy - The scroll Y delta, in pixels.
     */
    scrollBy(dx: number, dy: number): void;
    /**
     * Scroll to the specified offset position.
     *
     * @param x - The scroll X offset, in pixels.
     *
     * @param y - The scroll Y offset, in pixels.
     *
     * #### Notes
     * The scroll position will be clamped to the allowable range.
     *
     * Fractional values will be rounded to the nearest integer.
     */
    scrollTo(x: number, y: number): void;
    /**
     * Schedule a repaint of the data grid.
     *
     * @param x - The viewport X coordinate of the dirty rect.
     *
     * @param y - The viewport Y coordinate of the dirty rect.
     *
     * @param w - The width of the dirty rect.
     *
     * @param h - The height of the dirty rect.
     *
     * #### Notes
     * This method is called automatically when changing the state of the
     * data grid. However, it may be called manually to repaint the grid
     * whenever external program state change necessitates an update.
     *
     * Multiple synchronous requests are collapsed into a single repaint.
     *
     * The no-argument form of this method will repaint the entire grid.
     */
    repaint(): void;
    repaint(x: number, y: number, width: number, height: number): void;
    /**
     * Process a message sent to the widget.
     *
     * @param msg - The message sent to the widget.
     */
    processMessage(msg: Message): void;
    /**
     * Intercept a message sent to a message handler.
     *
     * @param handler - The target handler of the message.
     *
     * @param msg - The message to be sent to the handler.
     *
     * @returns `true` if the message should continue to be processed
     *   as normal, or `false` if processing should cease immediately.
     */
    messageHook(handler: IMessageHandler, msg: Message): boolean;
    /**
     * Handle the DOM events for the data grid.
     *
     * @param event - The DOM event sent to the data grid.
     *
     * #### Notes
     * This method implements the DOM `EventListener` interface and is
     * called in response to events on the data grid's DOM node. It
     * should not be called directly by user code.
     */
    handleEvent(event: Event): void;
    /**
     * A message handler invoked on a `'before-attach'` message.
     */
    protected onBeforeAttach(msg: Message): void;
    /**
     * A message handler invoked on an `'after-detach'` message.
     */
    protected onAfterDetach(msg: Message): void;
    /**
     * A message handler invoked on a `'before-show'` message.
     */
    protected onBeforeShow(msg: Message): void;
    /**
     * A message handler invoked on a `'resize'` message.
     */
    protected onResize(msg: Widget.ResizeMessage): void;
    /**
     * Refresh the internal dpi ratio.
     *
     * This will update the canvas size and schedule a repaint if needed.
     */
    private _refreshDPI;
    /**
     * Ensure the canvas is at least the specified size.
     *
     * This method will retain the valid canvas content.
     */
    private _resizeCanvasIfNeeded;
    /**
     * Sync the scroll bars and scroll state with the viewport.
     *
     * #### Notes
     * If the visibility of either scroll bar changes, a synchronous
     * fit-request will be dispatched to the data grid to immediately
     * resize the viewport.
     */
    private _syncScrollState;
    /**
     * Sync the viewport to the given scroll position.
     *
     * #### Notes
     * This schedules a full repaint and syncs the scroll state.
     */
    private _syncViewport;
    /**
     * Get the section list for the specified grid area.
     */
    private _getSectionList;
    /**
     * Set the base size for the given section list.
     *
     * #### Notes
     * This will update the scroll bars and repaint as needed.
     */
    private _setBaseSize;
    /**
     * Resize a section in the given section list.
     *
     * #### Notes
     * This will update the scroll bars and repaint as needed.
     */
    private _resizeSection;
    /**
     * Hit test the grid headers for a resize handle.
     */
    private _hitTestResizeHandles;
    /**
     * Handle the `'keydown'` event for the data grid.
     */
    private _evtKeyDown;
    /**
     * Handle the `'mousedown'` event for the data grid.
     */
    private _evtMouseDown;
    /**
     * Handle the `mousemove` event for the data grid.
     */
    private _evtMouseMove;
    /**
     * Handle the `mouseup` event for the data grid.
     */
    private _evtMouseUp;
    /**
     * Handle the `'wheel'` event for the data grid.
     */
    private _evtWheel;
    /**
     * Release the mouse grab for the data grid.
     */
    private _releaseMouse;
    /**
     * Process a message sent to the viewport
     */
    private _processViewportMessage;
    /**
     * A message hook invoked on a viewport `'scroll-request'` message.
     */
    private _onViewportScrollRequest;
    /**
     * A message hook invoked on a `'section-resize-request'` message.
     */
    private _onViewportSectionResizeRequest;
    /**
     * A message hook invoked on a viewport `'resize'` message.
     */
    private _onViewportResize;
    /**
     * A message hook invoked on a viewport `'paint-request'` message.
     */
    private _onViewportPaintRequest;
    /**
     * Handle the `thumbMoved` signal from a scroll bar.
     */
    private _onThumbMoved;
    /**
     * Handle the `pageRequested` signal from a scroll bar.
     */
    private _onPageRequested;
    /**
     * Handle the `stepRequested` signal from a scroll bar.
     */
    private _onStepRequested;
    /**
     * A signal handler for the data model `changed` signal.
     */
    private _onModelChanged;
    /**
     * Handle sections changing in the data model.
     */
    private _onSectionsChanged;
    /**
     * Handle sections moving in the data model.
     */
    private _onSectionsMoved;
    /**
     * Handle cells changing in the data model.
     */
    private _onCellsChanged;
    /**
     * Handle a full data model reset.
     */
    private _onModelReset;
    /**
     * A signal handler for the renderer map `changed` signal.
     */
    private _onRenderersChanged;
    /**
     * Blit content into the on-screen canvas.
     *
     * The rect should be expressed in viewport coordinates.
     *
     * This automatically accounts for the dpi ratio.
     */
    private _blit;
    /**
     * Paint the grid content for the given dirty rect.
     *
     * The rect should be expressed in viewport coordinates.
     *
     * This is the primary paint entry point. The individual `_draw*`
     * methods should not be invoked directly. This method dispatches
     * to the drawing methods in the correct order.
     */
    private _paint;
    /**
     * Draw the grid content for the given dirty rect.
     *
     * This method dispatches to the relevant `_draw*` methods.
     */
    private _draw;
    /**
     * Draw the void region for the dirty rect.
     */
    private _drawVoidRegion;
    /**
     * Draw the body region which intersects the dirty rect.
     */
    private _drawBodyRegion;
    /**
     * Draw the row header region which intersects the dirty rect.
     */
    private _drawRowHeaderRegion;
    /**
     * Draw the column header region which intersects the dirty rect.
     */
    private _drawColumnHeaderRegion;
    /**
     * Draw the corner header region which intersects the dirty rect.
     */
    private _drawCornerHeaderRegion;
    /**
     * Draw the background for the given paint region.
     */
    private _drawBackground;
    /**
     * Draw the row background for the given paint region.
     */
    private _drawRowBackground;
    /**
     * Draw the column background for the given paint region.
     */
    private _drawColumnBackground;
    /**
     * Draw the cells for the given paint region.
     */
    private _drawCells;
    /**
     * Draw the horizontal grid lines for the given paint region.
     */
    private _drawHorizontalGridLines;
    /**
     * Draw the vertical grid lines for the given paint region.
     */
    private _drawVerticalGridLines;
    private _viewport;
    private _vScrollBar;
    private _hScrollBar;
    private _scrollCorner;
    private _inPaint;
    private _paintPending;
    private _pressData;
    private _dpiRatio;
    private _scrollX;
    private _scrollY;
    private _viewportWidth;
    private _viewportHeight;
    private _vScrollBarMinWidth;
    private _hScrollBarMinHeight;
    private _canvas;
    private _buffer;
    private _canvasGC;
    private _bufferGC;
    private _rowSections;
    private _columnSections;
    private _rowHeaderSections;
    private _columnHeaderSections;
    private _model;
    private _style;
    private _cellRenderers;
    private _defaultRenderer;
    private _headerVisibility;
}
/**
 * The namespace for the `DataGrid` class statics.
 */
export declare namespace DataGrid {
    /**
     * An object which defines the style for a data grid.
     *
     * #### Notes
     * All style colors support the full CSS color syntax.
     */
    interface IStyle {
        /**
         * The void color for the data grid.
         *
         * This is the base fill color for the entire data grid.
         */
        readonly voidColor?: string;
        /**
         * The background color for the body cells.
         *
         * This color is layered on top of the `voidColor`.
         */
        readonly backgroundColor?: string;
        /**
         * A function which returns the background color for a row.
         *
         * This color is layered on top of the `backgroundColor` and can
         * be used to implement "zebra striping" of the grid rows.
         */
        readonly rowBackgroundColor?: (index: number) => string;
        /**
         * A function which returns the background color for a column.
         *
         * This color is layered on top of the `backgroundColor` and can
         * be used to implement "zebra striping" of the grid columns.
         */
        readonly columnBackgroundColor?: (index: number) => string;
        /**
         * The color for the grid lines of the body cells.
         *
         * The grid lines are draw on top of the cell contents.
         */
        readonly gridLineColor?: string;
        /**
         * The color for the vertical grid lines of the body cells.
         *
         * This overrides the `gridLineColor` option.
         */
        readonly verticalGridLineColor?: string;
        /**
         * The color for the horizontal grid lines of the body cells.
         *
         * This overrides the `gridLineColor` option.
         */
        readonly horizontalGridLineColor?: string;
        /**
         * The background color for the header cells.
         *
         * This color is layered on top of the `voidColor`.
         */
        readonly headerBackgroundColor?: string;
        /**
         * The color for the grid lines of the header cells.
         *
         * The grid lines are draw on top of the cell contents.
         */
        readonly headerGridLineColor?: string;
        /**
         * The color for the vertical grid lines of the header cells.
         *
         * This overrides the `headerGridLineColor` option.
         */
        readonly headerVerticalGridLineColor?: string;
        /**
         * The color for the horizontal grid lines of the header cells.
         *
         * This overrides the `headerGridLineColor` option.
         */
        readonly headerHorizontalGridLineColor?: string;
    }
    /**
     * A type alias for the supported header visibility modes.
     */
    type HeaderVisibility = 'all' | 'row' | 'column' | 'none';
    /**
     * An options object for initializing a data grid.
     */
    interface IOptions {
        /**
         * The style for the data grid.
         *
         * The default is `DataGrid.defaultStyle`.
         */
        style?: IStyle;
        /**
         * The header visibility for the data grid.
         *
         * The default is `'all'`.
         */
        headerVisibility?: HeaderVisibility;
        /**
         * The base size for rows in the data grid.
         *
         * The default is `20`.
         */
        baseRowSize?: number;
        /**
         * The base size for columns in the data grid.
         *
         * The default is `64`.
         */
        baseColumnSize?: number;
        /**
         * The base size for row headers in the data grid.
         *
         * The default is `64`.
         */
        baseRowHeaderSize?: number;
        /**
         * The base size for column headers in the data grid.
         *
         * The default is `20`.
         */
        baseColumnHeaderSize?: number;
        /**
         * The cell renderer map for the data grid.
         *
         * The default is an empty renderer map.
         */
        cellRenderers?: RendererMap;
        /**
         * The default cell renderer for the data grid.
         *
         * The default is a new `TextRenderer`.
         */
        defaultRenderer?: CellRenderer;
    }
    /**
     * The default theme for a data grid.
     */
    const defaultStyle: DataGrid.IStyle;
}
