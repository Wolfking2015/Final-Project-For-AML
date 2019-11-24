"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var domutils_1 = require("@phosphor/domutils");
var dragdrop_1 = require("@phosphor/dragdrop");
var messaging_1 = require("@phosphor/messaging");
var widgets_1 = require("@phosphor/widgets");
var datamodel_1 = require("./datamodel");
var graphicscontext_1 = require("./graphicscontext");
var renderermap_1 = require("./renderermap");
var sectionlist_1 = require("./sectionlist");
var textrenderer_1 = require("./textrenderer");
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
var DataGrid = /** @class */ (function (_super) {
    __extends(DataGrid, _super);
    /**
     * Construct a new data grid.
     *
     * @param options - The options for initializing the data grid.
     */
    function DataGrid(options) {
        if (options === void 0) { options = {}; }
        var _this = _super.call(this) || this;
        _this._inPaint = false;
        _this._paintPending = false; // TODO: would like to get rid of this flag
        _this._pressData = null;
        _this._dpiRatio = Math.ceil(window.devicePixelRatio);
        _this._scrollX = 0;
        _this._scrollY = 0;
        _this._viewportWidth = 0;
        _this._viewportHeight = 0;
        _this._vScrollBarMinWidth = 0;
        _this._hScrollBarMinHeight = 0;
        _this._model = null;
        _this.addClass('p-DataGrid');
        // Parse the simple options.
        _this._style = options.style || DataGrid.defaultStyle;
        _this._headerVisibility = options.headerVisibility || 'all';
        _this._cellRenderers = options.cellRenderers || new renderermap_1.RendererMap();
        _this._defaultRenderer = options.defaultRenderer || new textrenderer_1.TextRenderer();
        // Connect to the renderer map changed signal
        _this._cellRenderers.changed.connect(_this._onRenderersChanged, _this);
        // Parse the base section sizes.
        var brs = 20;
        var bcs = 64;
        var brhs = 64;
        var bchs = 20;
        if (options.baseRowSize !== undefined) {
            brs = options.baseRowSize;
        }
        if (options.baseColumnSize !== undefined) {
            bcs = options.baseColumnSize;
        }
        if (options.baseRowHeaderSize !== undefined) {
            brhs = options.baseRowHeaderSize;
        }
        if (options.baseColumnHeaderSize !== undefined) {
            bchs = options.baseColumnHeaderSize;
        }
        // Set up the sections lists.
        _this._rowSections = new sectionlist_1.SectionList({ baseSize: brs });
        _this._columnSections = new sectionlist_1.SectionList({ baseSize: bcs });
        _this._rowHeaderSections = new sectionlist_1.SectionList({ baseSize: brhs });
        _this._columnHeaderSections = new sectionlist_1.SectionList({ baseSize: bchs });
        // Create the canvas and buffer objects.
        _this._canvas = Private.createCanvas();
        _this._buffer = Private.createCanvas();
        // Get the graphics contexts for the canvases.
        _this._canvasGC = _this._canvas.getContext('2d');
        _this._bufferGC = _this._buffer.getContext('2d');
        // Set up the on-screen canvas.
        _this._canvas.style.position = 'absolute';
        _this._canvas.style.top = '0px';
        _this._canvas.style.left = '0px';
        _this._canvas.style.width = '0px';
        _this._canvas.style.height = '0px';
        // Create the internal widgets for the data grid.
        // TODO - support custom scroll bars and scroll corner?
        _this._viewport = new widgets_1.Widget();
        _this._vScrollBar = new widgets_1.ScrollBar({ orientation: 'vertical' });
        _this._hScrollBar = new widgets_1.ScrollBar({ orientation: 'horizontal' });
        _this._scrollCorner = new widgets_1.Widget();
        // Add the extra class names to the child widgets.
        _this._viewport.addClass('p-DataGrid-viewport');
        _this._vScrollBar.addClass('p-DataGrid-scrollBar');
        _this._hScrollBar.addClass('p-DataGrid-scrollBar');
        _this._scrollCorner.addClass('p-DataGrid-scrollCorner');
        // Add the on-screen canvas to the viewport node.
        _this._viewport.node.appendChild(_this._canvas);
        // Install the message hook for the viewport.
        messaging_1.MessageLoop.installMessageHook(_this._viewport, _this);
        // Hide the scroll bars and corner from the outset.
        _this._vScrollBar.hide();
        _this._hScrollBar.hide();
        _this._scrollCorner.hide();
        // Connect to the scroll bar signals.
        _this._vScrollBar.thumbMoved.connect(_this._onThumbMoved, _this);
        _this._hScrollBar.thumbMoved.connect(_this._onThumbMoved, _this);
        _this._vScrollBar.pageRequested.connect(_this._onPageRequested, _this);
        _this._hScrollBar.pageRequested.connect(_this._onPageRequested, _this);
        _this._vScrollBar.stepRequested.connect(_this._onStepRequested, _this);
        _this._hScrollBar.stepRequested.connect(_this._onStepRequested, _this);
        // Set the layout cell config for the child widgets.
        widgets_1.GridLayout.setCellConfig(_this._viewport, { row: 0, column: 0 });
        widgets_1.GridLayout.setCellConfig(_this._vScrollBar, { row: 0, column: 1 });
        widgets_1.GridLayout.setCellConfig(_this._hScrollBar, { row: 1, column: 0 });
        widgets_1.GridLayout.setCellConfig(_this._scrollCorner, { row: 1, column: 1 });
        // Create the layout for the data grid.
        var layout = new widgets_1.GridLayout({
            rowCount: 2,
            columnCount: 2,
            rowSpacing: 0,
            columnSpacing: 0,
            fitPolicy: 'set-no-constraint'
        });
        // Set the stretch factors for the grid.
        layout.setRowStretch(0, 1);
        layout.setRowStretch(1, 0);
        layout.setColumnStretch(0, 1);
        layout.setColumnStretch(1, 0);
        // Add the child widgets to the layout.
        layout.addWidget(_this._viewport);
        layout.addWidget(_this._vScrollBar);
        layout.addWidget(_this._hScrollBar);
        layout.addWidget(_this._scrollCorner);
        // Install the layout on the data grid.
        _this.layout = layout;
        return _this;
    }
    /**
     * Dispose of the resources held by the widgets.
     */
    DataGrid.prototype.dispose = function () {
        this._releaseMouse();
        this._model = null;
        this._rowSections.clear();
        this._columnSections.clear();
        this._rowHeaderSections.clear();
        this._columnHeaderSections.clear();
        _super.prototype.dispose.call(this);
    };
    Object.defineProperty(DataGrid.prototype, "model", {
        /**
         * Get the data model for the data grid.
         */
        get: function () {
            return this._model;
        },
        /**
         * Set the data model for the data grid.
         */
        set: function (value) {
            // Do nothing if the model does not change.
            if (this._model === value) {
                return;
            }
            // Disconnect the change handler from the old model.
            if (this._model) {
                this._model.changed.disconnect(this._onModelChanged, this);
            }
            // Connect the change handler for the new model.
            if (value) {
                value.changed.connect(this._onModelChanged, this);
            }
            // Update the internal model reference.
            this._model = value;
            // Clear the section lists.
            this._rowSections.clear();
            this._columnSections.clear();
            this._rowHeaderSections.clear();
            this._columnHeaderSections.clear();
            // Populate the section lists.
            if (value) {
                this._rowSections.insertSections(0, value.rowCount('body'));
                this._columnSections.insertSections(0, value.columnCount('body'));
                this._rowHeaderSections.insertSections(0, value.columnCount('row-header'));
                this._columnHeaderSections.insertSections(0, value.rowCount('column-header'));
            }
            // Reset the scroll position.
            this._scrollX = 0;
            this._scrollY = 0;
            // Sync the viewport.
            this._syncViewport();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DataGrid.prototype, "style", {
        /**
         * Get the style for the data grid.
         */
        get: function () {
            return this._style;
        },
        /**
         * Set the style for the data grid.
         */
        set: function (value) {
            // Bail if the style does not change.
            if (this._style === value) {
                return;
            }
            // Update the internal style.
            this._style = value;
            // Schedule a full repaint of the grid.
            this.repaint();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DataGrid.prototype, "cellRenderers", {
        /**
         * Get the cell renderer map for the data grid.
         */
        get: function () {
            return this._cellRenderers;
        },
        /**
         * Set the cell renderer map for the data grid.
         */
        set: function (value) {
            // Bail if the renderer map does not change.
            if (this._cellRenderers === value) {
                return;
            }
            // Disconnect the old map.
            this._cellRenderers.changed.disconnect(this._onRenderersChanged, this);
            // Connect the new map.
            value.changed.connect(this._onRenderersChanged, this);
            // Update the internal renderer map.
            this._cellRenderers = value;
            // Schedule a full repaint of the grid.
            this.repaint();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DataGrid.prototype, "defaultRenderer", {
        /**
         * Get the default cell renderer for the data grid.
         */
        get: function () {
            return this._defaultRenderer;
        },
        /**
         * Set the default cell renderer for the data grid.
         */
        set: function (value) {
            // Bail if the renderer does not change.
            if (this._defaultRenderer === value) {
                return;
            }
            // Update the internal renderer.
            this._defaultRenderer = value;
            // Schedule a full repaint of the grid.
            this.repaint();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DataGrid.prototype, "headerVisibility", {
        /**
         * Get the header visibility for the data grid.
         */
        get: function () {
            return this._headerVisibility;
        },
        /**
         * Set the header visibility for the data grid.
         */
        set: function (value) {
            // Bail if the visibility does not change.
            if (this._headerVisibility === value) {
                return;
            }
            // Update the internal visibility.
            this._headerVisibility = value;
            // Sync the viewport.
            this._syncViewport();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DataGrid.prototype, "scrollX", {
        /**
         * The scroll X offset of the viewport.
         */
        get: function () {
            return this._scrollX;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DataGrid.prototype, "scrollY", {
        /**
         * The scroll Y offset of the viewport.
         */
        get: function () {
            return this._scrollY;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DataGrid.prototype, "maxScrollX", {
        /**
         * The maximum scroll X position for the current grid dimensions.
         *
         * #### Notes
         * This value is `1px` less than the theoretical maximum to allow the
         * the right-most grid line to be clipped when the vertical scroll bar
         * is visible.
         */
        get: function () {
            return Math.max(0, this.bodyWidth - this.pageWidth - 1);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DataGrid.prototype, "maxScrollY", {
        /**
         * The maximum scroll Y position for the current grid dimensions.
         *
         * #### Notes
         * This value is `1px` less than the theoretical maximum to allow the
         * the bottom-most grid line to be clipped when the horizontal scroll
         * bar is visible.
         */
        get: function () {
            return Math.max(0, this.bodyHeight - this.pageHeight - 1);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DataGrid.prototype, "bodyWidth", {
        /**
         * The virtual width of the grid body.
         *
         * #### Notes
         * This value does not include the width of the row headers.
         */
        get: function () {
            return this._columnSections.totalSize;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DataGrid.prototype, "bodyHeight", {
        /**
         * The virtual height of the grid body.
         *
         * #### Notes
         * This value does not include the height of the column headers.
         */
        get: function () {
            return this._rowSections.totalSize;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DataGrid.prototype, "headerWidth", {
        /**
         * The virtual width of the row headers.
         *
         * #### Notes
         * This will be `0` if the row headers are hidden.
         */
        get: function () {
            if (this._headerVisibility === 'none') {
                return 0;
            }
            if (this._headerVisibility === 'column') {
                return 0;
            }
            return this._rowHeaderSections.totalSize;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DataGrid.prototype, "headerHeight", {
        /**
         * The virtual height of the column headers.
         *
         * #### Notes
         * This will be `0` if the column headers are hidden.
         */
        get: function () {
            if (this._headerVisibility === 'none') {
                return 0;
            }
            if (this._headerVisibility === 'row') {
                return 0;
            }
            return this._columnHeaderSections.totalSize;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DataGrid.prototype, "totalWidth", {
        /**
         * The total virtual width of the grid.
         *
         * #### Notes
         * If the grid widget is sized larger than this width, a horizontal
         * scroll bar will not be shown.
         */
        get: function () {
            return this.headerWidth + this.bodyWidth;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DataGrid.prototype, "totalHeight", {
        /**
         * The total virtual height of the grid.
         *
         * #### Notes
         * If the grid widget is sized larger than this height, a vertical
         * scroll bar will not be shown.
         */
        get: function () {
            return this.headerHeight + this.bodyHeight;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DataGrid.prototype, "viewportWidth", {
        /**
         * The width of the visible portion of the data grid.
         *
         * #### Notes
         * This value does not include the width of the scroll bar.
         */
        get: function () {
            return this._viewportWidth;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DataGrid.prototype, "viewportHeight", {
        /**
         * The height of the visible portion of the data grid.
         *
         * #### Notes
         * This value does not include the height of the scroll bar.
         */
        get: function () {
            return this._viewportHeight;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DataGrid.prototype, "pageWidth", {
        /**
         * The width of the visible portion of the body cells.
         *
         * #### Notes
         * This value does not include the width of the row headers.
         */
        get: function () {
            return Math.max(0, this._viewportWidth - this.headerWidth);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DataGrid.prototype, "pageHeight", {
        /**
         * The height of the visible portion of the body cells.
         *
         * #### Notes
         * This value does not include the height of the column headers.
         */
        get: function () {
            return Math.max(0, this._viewportHeight - this.headerHeight);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DataGrid.prototype, "baseRowSize", {
        /**
         * Get the base size of the body rows.
         *
         * #### Notes
         * This is the size of rows which have not been resized.
         */
        get: function () {
            return this._rowSections.baseSize;
        },
        /**
         * Set the base size of the body rows.
         *
         * #### Notes
         * This is the size of rows which have not been resized.
         */
        set: function (value) {
            this._setBaseSize(this._rowSections, value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DataGrid.prototype, "baseColumnSize", {
        /**
         * Get the base size of the body columns.
         *
         * #### Notes
         * This is the size of columns which have not been resized.
         */
        get: function () {
            return this._columnSections.baseSize;
        },
        /**
         * Set the base size of the body columns.
         *
         * #### Notes
         * This is the size of columns which have not been resized.
         */
        set: function (value) {
            this._setBaseSize(this._columnSections, value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DataGrid.prototype, "baseRowHeaderSize", {
        /**
         * Get the base size of the row headers.
         *
         * #### Notes
         * This is the size of row headers which have not been resized.
         */
        get: function () {
            return this._rowHeaderSections.baseSize;
        },
        /**
         * Set the base size of the row headers.
         *
         * #### Notes
         * This is the size of row headers which have not been resized.
         */
        set: function (value) {
            this._setBaseSize(this._rowHeaderSections, value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DataGrid.prototype, "baseColumnHeaderSize", {
        /**
         * Get the base size of the column headers.
         *
         * #### Notes
         * This is the size of column headers which have not been resized.
         */
        get: function () {
            return this._columnHeaderSections.baseSize;
        },
        /**
         * Set the base size of the column headers.
         *
         * #### Notes
         * This is the size of column headers which have not been resized.
         */
        set: function (value) {
            this._setBaseSize(this._columnHeaderSections, value);
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Get the size of a section in the data grid.
     *
     * @param area - The grid area for the section of interest.
     *
     * @param index - The index of the section of interest.
     *
     * @return The size of the section, or `-1` if `index` is invalid.
     */
    DataGrid.prototype.sectionSize = function (area, index) {
        return this._getSectionList(area).sectionSize(index);
    };
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
    DataGrid.prototype.resizeSection = function (area, index, size) {
        this._resizeSection(this._getSectionList(area), index, size);
    };
    /**
     * Reset sections in the data grid to their base size.
     *
     * @param area - The grid area for the sections of interest.
     */
    DataGrid.prototype.resetSections = function (area) {
        this._getSectionList(area).reset();
        this._syncViewport();
    };
    /**
     * Scroll the viewport by one page.
     *
     * @param - The desired direction of the scroll.
     */
    DataGrid.prototype.scrollByPage = function (dir) {
        var dx = 0;
        var dy = 0;
        switch (dir) {
            case 'up':
                dy = -this.pageHeight;
                break;
            case 'down':
                dy = this.pageHeight;
                break;
            case 'left':
                dx = -this.pageWidth;
                break;
            case 'right':
                dx = this.pageWidth;
                break;
            default:
                throw 'unreachable';
        }
        this.scrollBy(dx, dy);
    };
    /**
     * Scroll the viewport by one cell-aligned step.
     *
     * @param - The desired direction of the scroll.
     */
    DataGrid.prototype.scrollByStep = function (dir) {
        var r;
        var c;
        var x = this._scrollX;
        var y = this._scrollY;
        var rows = this._rowSections;
        var columns = this._columnSections;
        switch (dir) {
            case 'up':
                r = rows.sectionIndex(y - 1);
                y = r < 0 ? y : rows.sectionOffset(r);
                break;
            case 'down':
                r = rows.sectionIndex(y);
                y = r < 0 ? y : rows.sectionOffset(r) + rows.sectionSize(r);
                break;
            case 'left':
                c = columns.sectionIndex(x - 1);
                x = c < 0 ? x : columns.sectionOffset(c);
                break;
            case 'right':
                c = columns.sectionIndex(x);
                x = c < 0 ? x : columns.sectionOffset(c) + columns.sectionSize(c);
                break;
            default:
                throw 'unreachable';
        }
        this.scrollTo(x, y);
    };
    /**
     * Scroll the viewport by the specified delta.
     *
     * @param dx - The scroll X delta, in pixels.
     *
     * @param dy - The scroll Y delta, in pixels.
     */
    DataGrid.prototype.scrollBy = function (dx, dy) {
        this.scrollTo(this._scrollX + dx, this._scrollY + dy);
    };
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
    DataGrid.prototype.scrollTo = function (x, y) {
        // Floor and clamp the position to the allowable range.
        x = Math.max(0, Math.min(Math.floor(x), this.maxScrollX));
        y = Math.max(0, Math.min(Math.floor(y), this.maxScrollY));
        // Always synchronize the scroll bar values.
        this._hScrollBar.value = x;
        this._vScrollBar.value = y;
        // Compute the delta scroll amount.
        var dx = x - this._scrollX;
        var dy = y - this._scrollY;
        // Bail early if there is no effective scroll.
        if (dx === 0 && dy === 0) {
            return;
        }
        // If there is a paint pending, ensure it paints everything.
        if (this._paintPending) {
            this._scrollX = x;
            this._scrollY = y;
            this.repaint();
            return;
        }
        // Bail early if the viewport is not visible.
        if (!this._viewport.isVisible) {
            this._scrollX = x;
            this._scrollY = y;
            return;
        }
        // Get the current size of the viewport.
        var width = this._viewportWidth;
        var height = this._viewportHeight;
        // Bail early if the viewport is empty.
        if (width === 0 || height === 0) {
            this._scrollX = x;
            this._scrollY = y;
            return;
        }
        // Get the visible content origin.
        var contentX = this.headerWidth;
        var contentY = this.headerHeight;
        // Get the visible content dimensions.
        var contentWidth = width - contentX;
        var contentHeight = height - contentY;
        // Bail early if there is no content to draw.
        if (contentWidth <= 0 && contentHeight <= 0) {
            this._scrollX = x;
            this._scrollY = y;
            return;
        }
        // Compute the area which needs painting for the `dx` scroll.
        var dxArea = 0;
        if (dx !== 0 && contentWidth > 0) {
            if (Math.abs(dx) >= contentWidth) {
                dxArea = contentWidth * height;
            }
            else {
                dxArea = Math.abs(dx) * height;
            }
        }
        // Compute the area which needs painting for the `dy` scroll.
        var dyArea = 0;
        if (dy !== 0 && contentHeight > 0) {
            if (Math.abs(dy) >= contentHeight) {
                dyArea = width * contentHeight;
            }
            else {
                dyArea = width * Math.abs(dy);
            }
        }
        // If the area sum is larger than the total, paint everything.
        if ((dxArea + dyArea) >= (width * height)) {
            this._scrollX = x;
            this._scrollY = y;
            this._paint(0, 0, width, height);
            return;
        }
        // Update the internal Y scroll position.
        this._scrollY = y;
        // Scroll the Y axis if needed. If the scroll distance exceeds
        // the visible height, paint everything. Otherwise, blit the
        // valid content and paint the dirty region.
        if (dy !== 0 && contentHeight > 0) {
            if (Math.abs(dy) >= contentHeight) {
                this._paint(0, contentY, width, contentHeight);
            }
            else {
                var x_1 = 0;
                var y_1 = dy < 0 ? contentY : contentY + dy;
                var w = width;
                var h = contentHeight - Math.abs(dy);
                this._blit(this._canvas, x_1, y_1, w, h, x_1, y_1 - dy);
                this._paint(0, dy < 0 ? contentY : height - dy, width, Math.abs(dy));
            }
        }
        // Update the internal X scroll position.
        this._scrollX = x;
        // Scroll the X axis if needed. If the scroll distance exceeds
        // the visible width, paint everything. Otherwise, blit the
        // valid content and paint the dirty region.
        if (dx !== 0 && contentWidth > 0) {
            if (Math.abs(dx) >= contentWidth) {
                this._paint(contentX, 0, contentWidth, height);
            }
            else {
                var x_2 = dx < 0 ? contentX : contentX + dx;
                var y_2 = 0;
                var w = contentWidth - Math.abs(dx);
                var h = height;
                this._blit(this._canvas, x_2, y_2, w, h, x_2 - dx, y_2);
                this._paint(dx < 0 ? contentX : width - dx, 0, Math.abs(dx), height);
            }
        }
    };
    DataGrid.prototype.repaint = function () {
        // Parse the arguments.
        var x;
        var y;
        var w;
        var h;
        switch (arguments.length) {
            case 0:
                x = 0;
                y = 0;
                w = this._viewportWidth;
                h = this._viewportHeight;
                break;
            case 4:
                x = Math.floor(arguments[0]);
                y = Math.floor(arguments[1]);
                w = Math.floor(arguments[2]);
                h = Math.floor(arguments[3]);
                break;
            default:
                throw 'unreachable';
        }
        // Bail early if there is nothing to paint.
        if (w <= 0 || h <= 0) {
            return;
        }
        // Set the paint pending flag.
        this._paintPending = true;
        // Create the paint request message.
        var msg = new Private.PaintRequest(x, y, x + w - 1, y + h - 1);
        // Post the paint request to the viewport.
        messaging_1.MessageLoop.postMessage(this._viewport, msg);
    };
    /**
     * Process a message sent to the widget.
     *
     * @param msg - The message sent to the widget.
     */
    DataGrid.prototype.processMessage = function (msg) {
        // Ignore child show/hide messages. The data grid controls the
        // visibility of its children, and will manually dispatch the
        // fit-request messages as a result of visibility change.
        if (msg.type === 'child-shown' || msg.type === 'child-hidden') {
            return;
        }
        // Recompute the scroll bar minimums before the layout refits.
        if (msg.type === 'fit-request') {
            var vsbLimits = domutils_1.ElementExt.sizeLimits(this._vScrollBar.node);
            var hsbLimits = domutils_1.ElementExt.sizeLimits(this._hScrollBar.node);
            this._vScrollBarMinWidth = vsbLimits.minWidth;
            this._hScrollBarMinHeight = hsbLimits.minHeight;
        }
        // Process all other messages as normal.
        _super.prototype.processMessage.call(this, msg);
    };
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
    DataGrid.prototype.messageHook = function (handler, msg) {
        if (handler === this._viewport) {
            this._processViewportMessage(msg);
        }
        return true;
    };
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
    DataGrid.prototype.handleEvent = function (event) {
        switch (event.type) {
            case 'mousedown':
                this._evtMouseDown(event);
                break;
            case 'mousemove':
                this._evtMouseMove(event);
                break;
            case 'mouseup':
                this._evtMouseUp(event);
                break;
            case 'wheel':
                this._evtWheel(event);
                break;
            case 'keydown':
                this._evtKeyDown(event);
                break;
            case 'contextmenu':
                event.preventDefault();
                event.stopPropagation();
                break;
            case 'resize':
                this._refreshDPI();
                break;
        }
    };
    /**
     * A message handler invoked on a `'before-attach'` message.
     */
    DataGrid.prototype.onBeforeAttach = function (msg) {
        window.addEventListener('resize', this);
        this.node.addEventListener('wheel', this);
        this.node.addEventListener('mousedown', this);
        this._viewport.node.addEventListener('mousemove', this);
        this.repaint(); // TODO actually need to fit the viewport ?
    };
    /**
     * A message handler invoked on an `'after-detach'` message.
     */
    DataGrid.prototype.onAfterDetach = function (msg) {
        window.removeEventListener('resize', this);
        this.node.removeEventListener('wheel', this);
        this.node.removeEventListener('mousedown', this);
        this._viewport.node.removeEventListener('mousemove', this);
        this._releaseMouse();
    };
    /**
     * A message handler invoked on a `'before-show'` message.
     */
    DataGrid.prototype.onBeforeShow = function (msg) {
        this.repaint(); // TODO actually need to fit the viewport ?
    };
    /**
     * A message handler invoked on a `'resize'` message.
     */
    DataGrid.prototype.onResize = function (msg) {
        this._syncScrollState();
    };
    /**
     * Refresh the internal dpi ratio.
     *
     * This will update the canvas size and schedule a repaint if needed.
     */
    DataGrid.prototype._refreshDPI = function () {
        // Get the best integral value for the dpi ratio.
        var dpiRatio = Math.ceil(window.devicePixelRatio);
        // Bail early if the computed dpi ratio has not changed.
        if (this._dpiRatio === dpiRatio) {
            return;
        }
        // Update the internal dpi ratio.
        this._dpiRatio = dpiRatio;
        // Schedule a full repaint of the grid.
        this.repaint();
        // Update the canvas size for the new dpi ratio.
        this._resizeCanvasIfNeeded(this._viewportWidth, this._viewportHeight);
        // Ensure the canvas style is scaled for the new ratio.
        this._canvas.style.width = this._canvas.width / this._dpiRatio + "px";
        this._canvas.style.height = this._canvas.height / this._dpiRatio + "px";
    };
    /**
     * Ensure the canvas is at least the specified size.
     *
     * This method will retain the valid canvas content.
     */
    DataGrid.prototype._resizeCanvasIfNeeded = function (width, height) {
        // Scale the size by the dpi ratio.
        width = width * this._dpiRatio;
        height = height * this._dpiRatio;
        // Compute the maximum canvas size for the given width.
        var maxW = (Math.ceil((width + 1) / 512) + 1) * 512;
        var maxH = (Math.ceil((height + 1) / 512) + 1) * 512;
        // Get the current size of the canvas.
        var curW = this._canvas.width;
        var curH = this._canvas.height;
        // Bail early if the canvas size is within bounds.
        if (curW >= width && curH >= height && curW <= maxW && curH <= maxH) {
            return;
        }
        // Compute the expanded canvas size.
        var expW = maxW - 512;
        var expH = maxH - 512;
        // Set the transforms to the identity matrix.
        this._canvasGC.setTransform(1, 0, 0, 1, 0, 0);
        this._bufferGC.setTransform(1, 0, 0, 1, 0, 0);
        // Resize the buffer width if needed.
        if (curW < width) {
            this._buffer.width = expW;
        }
        else if (curW > maxW) {
            this._buffer.width = maxW;
        }
        // Resize the buffer height if needed.
        if (curH < height) {
            this._buffer.height = expH;
        }
        else if (curH > maxH) {
            this._buffer.height = maxH;
        }
        // Test whether there is content to blit.
        var needBlit = curH > 0 && curH > 0 && width > 0 && height > 0;
        // Copy the valid content into the buffer if needed.
        if (needBlit) {
            this._bufferGC.drawImage(this._canvas, 0, 0);
        }
        // Resize the canvas width if needed.
        if (curW < width) {
            this._canvas.width = expW;
            this._canvas.style.width = expW / this._dpiRatio + "px";
        }
        else if (curW > maxW) {
            this._canvas.width = maxW;
            this._canvas.style.width = maxW / this._dpiRatio + "px";
        }
        // Resize the canvas height if needed.
        if (curH < height) {
            this._canvas.height = expH;
            this._canvas.style.height = expH / this._dpiRatio + "px";
        }
        else if (curH > maxH) {
            this._canvas.height = maxH;
            this._canvas.style.height = maxH / this._dpiRatio + "px";
        }
        // Copy the valid content from the buffer if needed.
        if (needBlit) {
            this._canvasGC.drawImage(this._buffer, 0, 0);
        }
    };
    /**
     * Sync the scroll bars and scroll state with the viewport.
     *
     * #### Notes
     * If the visibility of either scroll bar changes, a synchronous
     * fit-request will be dispatched to the data grid to immediately
     * resize the viewport.
     */
    DataGrid.prototype._syncScrollState = function () {
        // Fetch the viewport dimensions.
        var bw = this.bodyWidth;
        var bh = this.bodyHeight;
        var pw = this.pageWidth;
        var ph = this.pageHeight;
        // Get the current scroll bar visibility.
        var hasVScroll = !this._vScrollBar.isHidden;
        var hasHScroll = !this._hScrollBar.isHidden;
        // Get the minimum sizes of the scroll bars.
        var vsw = this._vScrollBarMinWidth;
        var hsh = this._hScrollBarMinHeight;
        // Get the page size as if no scroll bars are visible.
        var apw = pw + (hasVScroll ? vsw : 0);
        var aph = ph + (hasHScroll ? hsh : 0);
        // Test whether scroll bars are needed for the adjusted size.
        var needVScroll = aph < bh - 1;
        var needHScroll = apw < bw - 1;
        // Re-test the horizontal scroll if a vertical scroll is needed.
        if (needVScroll && !needHScroll) {
            needHScroll = (apw - vsw) < bw - 1;
        }
        // Re-test the vertical scroll if a horizontal scroll is needed.
        if (needHScroll && !needVScroll) {
            needVScroll = (aph - hsh) < bh - 1;
        }
        // If the visibility changes, immediately refit the grid.
        if (needVScroll !== hasVScroll || needHScroll !== hasHScroll) {
            this._vScrollBar.setHidden(!needVScroll);
            this._hScrollBar.setHidden(!needHScroll);
            this._scrollCorner.setHidden(!needVScroll || !needHScroll);
            messaging_1.MessageLoop.sendMessage(this, widgets_1.Widget.Msg.FitRequest);
        }
        // Update the scroll bar limits.
        this._vScrollBar.maximum = this.maxScrollY;
        this._vScrollBar.page = this.pageHeight;
        this._hScrollBar.maximum = this.maxScrollX;
        this._hScrollBar.page = this.pageWidth;
        // Re-clamp the scroll position.
        this.scrollTo(this._scrollX, this._scrollY);
    };
    /**
     * Sync the viewport to the given scroll position.
     *
     * #### Notes
     * This schedules a full repaint and syncs the scroll state.
     */
    DataGrid.prototype._syncViewport = function () {
        // Schedule a full repaint of the viewport.
        this.repaint();
        // Sync the scroll state after requesting the repaint.
        this._syncScrollState();
    };
    /**
     * Get the section list for the specified grid area.
     */
    DataGrid.prototype._getSectionList = function (area) {
        var list;
        switch (area) {
            case 'row':
                list = this._rowSections;
                break;
            case 'column':
                list = this._columnSections;
                break;
            case 'row-header':
                list = this._rowHeaderSections;
                break;
            case 'column-header':
                list = this._columnHeaderSections;
                break;
            default:
                throw 'unreachable';
        }
        return list;
    };
    /**
     * Set the base size for the given section list.
     *
     * #### Notes
     * This will update the scroll bars and repaint as needed.
     */
    DataGrid.prototype._setBaseSize = function (list, size) {
        // Normalize the size.
        size = Math.max(0, Math.floor(size));
        // Bail early if the size does not change.
        if (list.baseSize === size) {
            return;
        }
        // Update the list base size.
        list.baseSize = size;
        // Sync the viewport
        this._syncViewport();
    };
    /**
     * Resize a section in the given section list.
     *
     * #### Notes
     * This will update the scroll bars and repaint as needed.
     */
    DataGrid.prototype._resizeSection = function (list, index, size) {
        // Bail early if the index is out of range.
        if (index < 0 || index >= list.sectionCount) {
            return;
        }
        // Look up the old size of the section.
        var oldSize = list.sectionSize(index);
        // Normalize the new size of the section.
        var newSize = Math.max(0, Math.floor(size));
        // Bail early if the size does not change.
        if (oldSize === newSize) {
            return;
        }
        // Resize the section in the list.
        list.resizeSection(index, newSize);
        // Get the current size of the viewport.
        var vpWidth = this._viewportWidth;
        var vpHeight = this._viewportHeight;
        // If there is nothing to paint, sync the scroll state.
        if (!this._viewport.isVisible || vpWidth === 0 || vpHeight === 0) {
            this._syncScrollState();
            return;
        }
        // If a paint is already pending, sync the viewport.
        if (this._paintPending) {
            this._syncViewport();
            return;
        }
        // Compute the size delta.
        var delta = newSize - oldSize;
        // Paint the relevant dirty regions.
        switch (list) {
            case this._rowSections:
                {
                    // Look up the column header height.
                    var hh = this.headerHeight;
                    // Compute the viewport offset of the section.
                    var offset = list.sectionOffset(index) + hh - this._scrollY;
                    // Bail early if there is nothing to paint.
                    if (hh >= vpHeight || offset > vpHeight) {
                        break;
                    }
                    // Update the scroll position if the section is not visible.
                    if (offset + oldSize <= hh) {
                        this._scrollY += delta;
                        break;
                    }
                    // Compute the paint origin of the section.
                    var pos = Math.max(hh, offset);
                    // Paint from the section onward if it spans the viewport.
                    if (offset + oldSize >= vpHeight || offset + newSize >= vpHeight) {
                        this._paint(0, pos, vpWidth, vpHeight - pos);
                        break;
                    }
                    // Compute the X blit dimensions.
                    var sx = 0;
                    var sw = vpWidth;
                    var dx = 0;
                    // Compute the Y blit dimensions.
                    var sy = void 0;
                    var sh = void 0;
                    var dy = void 0;
                    if (offset + newSize <= hh) {
                        sy = hh - delta;
                        sh = vpHeight - sy;
                        dy = hh;
                    }
                    else {
                        sy = offset + oldSize;
                        sh = vpHeight - sy;
                        dy = sy + delta;
                    }
                    // Blit the valid content to the destination.
                    this._blit(this._canvas, sx, sy, sw, sh, dx, dy);
                    // Repaint the section if needed.
                    if (newSize > 0 && offset + newSize > hh) {
                        this._paint(0, pos, vpWidth, offset + newSize - pos);
                    }
                    // Paint the trailing space if needed.
                    if (delta < 0) {
                        this._paint(0, vpHeight + delta, vpWidth, -delta);
                    }
                    // Done.
                    break;
                }
            case this._columnSections:
                {
                    // Look up the row header width.
                    var hw = this.headerWidth;
                    // Compute the viewport offset of the section.
                    var offset = list.sectionOffset(index) + hw - this._scrollX;
                    // Bail early if there is nothing to paint.
                    if (hw >= vpWidth || offset > vpWidth) {
                        break;
                    }
                    // Update the scroll position if the section is not visible.
                    if (offset + oldSize <= hw) {
                        this._scrollX += delta;
                        break;
                    }
                    // Compute the paint origin of the section.
                    var pos = Math.max(hw, offset);
                    // Paint from the section onward if it spans the viewport.
                    if (offset + oldSize >= vpWidth || offset + newSize >= vpWidth) {
                        this._paint(pos, 0, vpWidth - pos, vpHeight);
                        break;
                    }
                    // Compute the Y blit dimensions.
                    var sy = 0;
                    var sh = vpHeight;
                    var dy = 0;
                    // Compute the X blit dimensions.
                    var sx = void 0;
                    var sw = void 0;
                    var dx = void 0;
                    if (offset + newSize <= hw) {
                        sx = hw - delta;
                        sw = vpWidth - sx;
                        dx = hw;
                    }
                    else {
                        sx = offset + oldSize;
                        sw = vpWidth - sx;
                        dx = sx + delta;
                    }
                    // Blit the valid content to the destination.
                    this._blit(this._canvas, sx, sy, sw, sh, dx, dy);
                    // Repaint the section if needed.
                    if (newSize > 0 && offset + newSize > hw) {
                        this._paint(pos, 0, offset + newSize - pos, vpHeight);
                    }
                    // Paint the trailing space if needed.
                    if (delta < 0) {
                        this._paint(vpWidth + delta, 0, -delta, vpHeight);
                    }
                    // Done.
                    break;
                }
            case this._rowHeaderSections:
                {
                    // Look up the offset of the section.
                    var offset = list.sectionOffset(index);
                    // Bail early if the section is fully outside the viewport.
                    if (offset >= vpWidth) {
                        break;
                    }
                    // Paint the entire tail if the section spans the viewport.
                    if (offset + oldSize >= vpWidth || offset + newSize >= vpWidth) {
                        this._paint(offset, 0, vpWidth - offset, vpHeight);
                        break;
                    }
                    // Compute the blit content dimensions.
                    var sx = offset + oldSize;
                    var sy = 0;
                    var sw = vpWidth - sx;
                    var sh = vpHeight;
                    var dx = sx + delta;
                    var dy = 0;
                    // Blit the valid contents to the destination.
                    this._blit(this._canvas, sx, sy, sw, sh, dx, dy);
                    // Repaint the header section if needed.
                    if (newSize > 0) {
                        this._paint(offset, 0, newSize, vpHeight);
                    }
                    // Paint the trailing space if needed.
                    if (delta < 0) {
                        this._paint(vpWidth + delta, 0, -delta, vpHeight);
                    }
                    // Done
                    break;
                }
            case this._columnHeaderSections:
                {
                    // Look up the offset of the section.
                    var offset = list.sectionOffset(index);
                    // Bail early if the section is fully outside the viewport.
                    if (offset >= vpHeight) {
                        break;
                    }
                    // Paint the entire tail if the section spans the viewport.
                    if (offset + oldSize >= vpHeight || offset + newSize >= vpHeight) {
                        this._paint(0, offset, vpWidth, vpHeight - offset);
                        break;
                    }
                    // Compute the blit content dimensions.
                    var sx = 0;
                    var sy = offset + oldSize;
                    var sw = vpWidth;
                    var sh = vpHeight - sy;
                    var dx = 0;
                    var dy = sy + delta;
                    // Blit the valid contents to the destination.
                    this._blit(this._canvas, sx, sy, sw, sh, dx, dy);
                    // Repaint the header section if needed.
                    if (newSize > 0) {
                        this._paint(0, offset, vpWidth, newSize);
                    }
                    // Paint the trailing space if needed.
                    if (delta < 0) {
                        this._paint(0, vpHeight + delta, vpWidth, -delta);
                    }
                    // Done
                    break;
                }
            default:
                throw 'unreachable';
        }
        // Sync the scroll state after painting.
        this._syncScrollState();
    };
    /**
     * Hit test the grid headers for a resize handle.
     */
    DataGrid.prototype._hitTestResizeHandles = function (clientX, clientY) {
        // Look up the header dimensions.
        var hw = this.headerWidth;
        var hh = this.headerHeight;
        // Convert the mouse position into local coordinates.
        var rect = this._viewport.node.getBoundingClientRect();
        var x = clientX - rect.left;
        var y = clientY - rect.top;
        // Bail early if the mouse is not over a grid header.
        if (x >= hw && y >= hh) {
            return null;
        }
        // Test for a match in the corner header first.
        if (x <= hw + 2 && y <= hh + 2) {
            // Set up the resize index data.
            var data = null;
            // Check for a column match if applicable.
            if (y <= hh) {
                data = Private.findResizeIndex(this._rowHeaderSections, x);
            }
            // Return the column match if found.
            if (data) {
                return { type: 'header-column', index: data.index, delta: data.delta };
            }
            // Check for a row match if applicable.
            if (x <= hw) {
                data = Private.findResizeIndex(this._columnHeaderSections, y);
            }
            // Return the row match if found.
            if (data) {
                return { type: 'header-row', index: data.index, delta: data.delta };
            }
            // Otherwise, there was no match.
            return null;
        }
        // Test for a match in the column header second.
        if (y <= hh) {
            // Convert the position into unscrolled coordinates.
            var pos = x + this._scrollX - hw;
            // Check for a match.
            var data = Private.findResizeIndex(this._columnSections, pos);
            // Return the column match if found.
            if (data) {
                return { type: 'body-column', index: data.index, delta: data.delta };
            }
            // Otherwise, there was no match.
            return null;
        }
        // Test for a match in the row header last.
        if (x <= hw) {
            // Convert the position into unscrolled coordinates.
            var pos = y + this._scrollY - hh;
            // Check for a match.
            var data = Private.findResizeIndex(this._rowSections, pos);
            // Return the row match if found.
            if (data) {
                return { type: 'body-row', index: data.index, delta: data.delta };
            }
            // Otherwise, there was no match.
            return null;
        }
        // Otherwise, there was no match.
        return null;
    };
    /**
     * Handle the `'keydown'` event for the data grid.
     */
    DataGrid.prototype._evtKeyDown = function (event) {
        // Stop input events during drag.
        event.preventDefault();
        event.stopPropagation();
        // Release the mouse if `Escape` is pressed.
        if (event.keyCode === 27) {
            this._releaseMouse();
        }
    };
    /**
     * Handle the `'mousedown'` event for the data grid.
     */
    DataGrid.prototype._evtMouseDown = function (event) {
        // Do nothing if the left mouse button is not pressed.
        if (event.button !== 0) {
            return;
        }
        // Extract the client position.
        var clientX = event.clientX, clientY = event.clientY;
        // Hit test the grid headers for a resize handle.
        var handle = this._hitTestResizeHandles(clientX, clientY);
        // Bail early if no resize handle is pressed.
        if (!handle) {
            return;
        }
        // Stop the event when a resize handle is pressed.
        event.preventDefault();
        event.stopPropagation();
        // Look up the cursor for the handle.
        var cursor = Private.cursorForHandle(handle);
        // Override the document cursor.
        var override = dragdrop_1.Drag.overrideCursor(cursor);
        // Set up the press data.
        this._pressData = { handle: handle, clientX: clientX, clientY: clientY, override: override };
        // Add the extra document listeners.
        document.addEventListener('mousemove', this, true);
        document.addEventListener('mouseup', this, true);
        document.addEventListener('keydown', this, true);
        document.addEventListener('contextmenu', this, true);
    };
    /**
     * Handle the `mousemove` event for the data grid.
     */
    DataGrid.prototype._evtMouseMove = function (event) {
        // If a drag is not in progress, the event is for the viewport.
        if (!this._pressData) {
            // Hit test the grid headers for a resize handle.
            var handle = this._hitTestResizeHandles(event.clientX, event.clientY);
            // Update the viewport cursor.
            this._viewport.node.style.cursor = Private.cursorForHandle(handle);
            // Done.
            return;
        }
        // Otherwise, the event is for the drag in progress.
        // Stop the event.
        event.preventDefault();
        event.stopPropagation();
        // Update the press data with the current mouse position.
        this._pressData.clientX = event.clientX;
        this._pressData.clientY = event.clientY;
        // Post a section resize request message to the viewport.
        messaging_1.MessageLoop.postMessage(this._viewport, Private.SectionResizeRequest);
    };
    /**
     * Handle the `mouseup` event for the data grid.
     */
    DataGrid.prototype._evtMouseUp = function (event) {
        // Do nothing if the left mouse button is not released.
        if (event.button !== 0) {
            return;
        }
        // Stop the event when releasing the mouse.
        event.preventDefault();
        event.stopPropagation();
        // Finalize the mouse release.
        this._releaseMouse();
    };
    /**
     * Handle the `'wheel'` event for the data grid.
     */
    DataGrid.prototype._evtWheel = function (event) {
        // Do nothing if a drag is in progress.
        if (this._pressData) {
            return;
        }
        // Do nothing if the `Ctrl` key is held.
        if (event.ctrlKey) {
            return;
        }
        // Extract the delta X and Y movement.
        var dx = event.deltaX;
        var dy = event.deltaY;
        // Convert the delta values to pixel values.
        switch (event.deltaMode) {
            case 0: // DOM_DELTA_PIXEL
                break;
            case 1: // DOM_DELTA_LINE
                dx *= this._columnSections.baseSize;
                dy *= this._rowSections.baseSize;
                break;
            case 2: // DOM_DELTA_PAGE
                dx *= this.pageWidth;
                dy *= this.pageHeight;
                break;
            default:
                throw 'unreachable';
        }
        // Test whether X scroll is needed.
        var needScrollX = ((dx < 0 && this.scrollX > 0) ||
            (dx > 0 && this.scrollX < this.maxScrollX));
        // Test whether Y scroll is needed.
        var needScrollY = ((dy < 0 && this.scrollY > 0) ||
            (dy > 0 && this.scrollY < this.maxScrollY));
        // Bail if no scrolling is needed.
        if (!needScrollX && !needScrollY) {
            return;
        }
        // Cancel the event if the grid is handling scrolling.
        event.preventDefault();
        event.stopPropagation();
        // Compute the desired scroll position.
        var x = Math.max(0, Math.min(this.scrollX + dx, this.maxScrollX));
        var y = Math.max(0, Math.min(this.scrollY + dy, this.maxScrollY));
        // Update the scroll bar values with the desired position.
        this._hScrollBar.value = x;
        this._vScrollBar.value = y;
        // Post a scroll request message to the viewport.
        messaging_1.MessageLoop.postMessage(this._viewport, Private.ScrollRequest);
    };
    /**
     * Release the mouse grab for the data grid.
     */
    DataGrid.prototype._releaseMouse = function () {
        // Bail early if no drag is in progress.
        if (!this._pressData) {
            return;
        }
        // Clear the press data and cursor override.
        this._pressData.override.dispose();
        this._pressData = null;
        // Remove the extra document listeners.
        document.removeEventListener('mousemove', this, true);
        document.removeEventListener('mouseup', this, true);
        document.removeEventListener('keydown', this, true);
        document.removeEventListener('contextmenu', this, true);
    };
    /**
     * Process a message sent to the viewport
     */
    DataGrid.prototype._processViewportMessage = function (msg) {
        switch (msg.type) {
            case 'scroll-request':
                this._onViewportScrollRequest(msg);
                break;
            case 'section-resize-request':
                this._onViewportSectionResizeRequest(msg);
                break;
            case 'resize':
                this._onViewportResize(msg);
                break;
            case 'paint-request':
                this._onViewportPaintRequest(msg);
                break;
            default:
                break;
        }
    };
    /**
     * A message hook invoked on a viewport `'scroll-request'` message.
     */
    DataGrid.prototype._onViewportScrollRequest = function (msg) {
        this.scrollTo(this._hScrollBar.value, this._vScrollBar.value);
    };
    /**
     * A message hook invoked on a `'section-resize-request'` message.
     */
    DataGrid.prototype._onViewportSectionResizeRequest = function (msg) {
        // Bail early if a drag is not in progress.
        if (!this._pressData) {
            return;
        }
        // Extract the relevant press data.
        var _a = this._pressData, handle = _a.handle, clientX = _a.clientX, clientY = _a.clientY;
        // Convert the client position to viewport coordinates.
        var rect = this._viewport.node.getBoundingClientRect();
        var x = clientX - rect.left;
        var y = clientY - rect.top;
        // Look up the section list and convert to section position.
        var pos;
        var list;
        switch (handle.type) {
            case 'body-row':
                pos = y + this._scrollY - this.headerHeight;
                list = this._rowSections;
                break;
            case 'body-column':
                pos = x + this._scrollX - this.headerWidth;
                list = this._columnSections;
                break;
            case 'header-row':
                pos = y;
                list = this._columnHeaderSections;
                break;
            case 'header-column':
                pos = x;
                list = this._rowHeaderSections;
                break;
            default:
                throw 'unreachable';
        }
        // Look up the offset for the handle.
        var offset = list.sectionOffset(handle.index);
        // Bail if the handle no longer exists.
        if (offset < 0) {
            return;
        }
        // Compute the new size for the section.
        var size = Math.max(4, pos - handle.delta - offset);
        // Resize the section to the computed size.
        this._resizeSection(list, handle.index, size);
    };
    /**
     * A message hook invoked on a viewport `'resize'` message.
     */
    DataGrid.prototype._onViewportResize = function (msg) {
        // Bail early if the viewport is not visible.
        if (!this._viewport.isVisible) {
            return;
        }
        // Unpack the message data.
        var width = msg.width, height = msg.height;
        // Measure the viewport node if the dimensions are unknown.
        if (width === -1) {
            width = this._viewport.node.offsetWidth;
        }
        if (height === -1) {
            height = this._viewport.node.offsetHeight;
        }
        // Round the dimensions to the nearest pixel.
        width = Math.round(width);
        height = Math.round(height);
        // Get the current size of the viewport.
        var oldWidth = this._viewportWidth;
        var oldHeight = this._viewportHeight;
        // Updated internal viewport size.
        this._viewportWidth = width;
        this._viewportHeight = height;
        // Resize the canvas if needed.
        this._resizeCanvasIfNeeded(width, height);
        // Compute the sizes of the dirty regions.
        var right = width - oldWidth;
        var bottom = height - oldHeight;
        // Bail if nothing needs to be painted.
        if (right <= 0 && bottom <= 0) {
            return;
        }
        // If there is a paint pending, ensure it paints everything.
        if (this._paintPending) {
            this.repaint();
            return;
        }
        // Paint the whole viewport if the old size was zero.
        if (oldWidth === 0 || oldHeight === 0) {
            this._paint(0, 0, width, height);
            return;
        }
        // Paint the dirty region to the right, if needed.
        if (right > 0) {
            this._paint(oldWidth, 0, right, height);
        }
        // Paint the dirty region to the bottom, if needed.
        if (bottom > 0 && width > right) {
            this._paint(0, oldHeight, width - right, bottom);
        }
    };
    /**
     * A message hook invoked on a viewport `'paint-request'` message.
     */
    DataGrid.prototype._onViewportPaintRequest = function (msg) {
        // Clear the paint pending flag.
        this._paintPending = false;
        // Bail early if the viewport is not visible.
        if (!this._viewport.isVisible) {
            return;
        }
        // Bail early if the viewport has zero area.
        if (this._viewportWidth === 0 || this._viewportHeight === 0) {
            return;
        }
        // Compute the paint bounds.
        var xMin = 0;
        var yMin = 0;
        var xMax = this._viewportWidth - 1;
        var yMax = this._viewportHeight - 1;
        // Unpack the message data.
        var x1 = msg.x1, y1 = msg.y1, x2 = msg.x2, y2 = msg.y2;
        // Bail early if the dirty rect is outside the bounds.
        if (x2 < xMin || y2 < yMin || x1 > xMax || y1 > yMax) {
            return;
        }
        // Clamp the dirty rect to the paint bounds.
        x1 = Math.max(xMin, Math.min(x1, xMax));
        y1 = Math.max(yMin, Math.min(y1, yMax));
        x2 = Math.max(xMin, Math.min(x2, xMax));
        y2 = Math.max(yMin, Math.min(y2, yMax));
        // Paint the dirty rect.
        this._paint(x1, y1, x2 - x1 + 1, y2 - y1 + 1);
    };
    /**
     * Handle the `thumbMoved` signal from a scroll bar.
     */
    DataGrid.prototype._onThumbMoved = function (sender) {
        messaging_1.MessageLoop.postMessage(this._viewport, Private.ScrollRequest);
    };
    /**
     * Handle the `pageRequested` signal from a scroll bar.
     */
    DataGrid.prototype._onPageRequested = function (sender, dir) {
        if (sender === this._vScrollBar) {
            this.scrollByPage(dir === 'decrement' ? 'up' : 'down');
        }
        else {
            this.scrollByPage(dir === 'decrement' ? 'left' : 'right');
        }
    };
    /**
     * Handle the `stepRequested` signal from a scroll bar.
     */
    DataGrid.prototype._onStepRequested = function (sender, dir) {
        if (sender === this._vScrollBar) {
            this.scrollByStep(dir === 'decrement' ? 'up' : 'down');
        }
        else {
            this.scrollByStep(dir === 'decrement' ? 'left' : 'right');
        }
    };
    /**
     * A signal handler for the data model `changed` signal.
     */
    DataGrid.prototype._onModelChanged = function (sender, args) {
        switch (args.type) {
            case 'rows-removed':
            case 'rows-inserted':
            case 'columns-removed':
            case 'columns-inserted':
                this._onSectionsChanged(args);
                break;
            case 'rows-moved':
            case 'columns-moved':
                this._onSectionsMoved(args);
                break;
            case 'cells-changed':
                this._onCellsChanged(args);
                break;
            case 'model-reset':
                this._onModelReset(args);
                break;
            default:
                throw 'unreachable';
        }
    };
    /**
     * Handle sections changing in the data model.
     */
    DataGrid.prototype._onSectionsChanged = function (args) {
        // TODO clean up this method. It's ugly.
        // Unpack the arg data.
        var region = args.region, type = args.type, index = args.index, span = args.span;
        // Bail early if there are no sections to insert.
        if (span <= 0) {
            return;
        }
        // Determine the behavior of the change type.
        var isRows = type === 'rows-inserted' || type === 'rows-removed';
        var isRemove = type === 'rows-removed' || type === 'columns-removed';
        // Look up the relevant section list.
        var list;
        if (region === 'body') {
            list = isRows ? this._rowSections : this._columnSections;
        }
        else {
            list = isRows ? this._columnHeaderSections : this._rowHeaderSections;
        }
        // Bail if the index is out of range.
        if (isRemove && (index < 0 || index >= list.sectionCount)) {
            return;
        }
        // Compute the paint offset and handle region-specific behavior.
        var offset;
        if (region !== 'body') {
            // Compute the paint offset.
            if (index >= list.sectionCount) {
                offset = list.totalSize;
            }
            else {
                offset = list.sectionOffset(index);
            }
            // Remove or insert the sections as needed.
            if (isRemove) {
                list.removeSections(index, span);
            }
            else {
                list.insertSections(index, span);
            }
        }
        else {
            // Look up the initial scroll geometry.
            var scrollPos1 = void 0;
            var maxScrollPos1 = void 0;
            if (isRows) {
                scrollPos1 = this._scrollY;
                maxScrollPos1 = this.maxScrollY;
            }
            else {
                scrollPos1 = this._scrollX;
                maxScrollPos1 = this.maxScrollX;
            }
            // Look up the target position.
            var targetPos = void 0;
            if (index >= list.sectionCount) {
                targetPos = list.totalSize;
            }
            else {
                targetPos = list.sectionOffset(index);
            }
            // Remove or Insert the sections and save the pre- and post- size.
            var size1 = list.totalSize;
            if (isRemove) {
                list.removeSections(index, span);
            }
            else {
                list.insertSections(index, span);
            }
            var size2 = list.totalSize;
            // Fetch the new max scroll position.
            var maxScrollPos2 = void 0;
            if (isRows) {
                maxScrollPos2 = this.maxScrollY;
            }
            else {
                maxScrollPos2 = this.maxScrollX;
            }
            // Adjust the scroll position as needed.
            var scrollPos2 = void 0;
            if (scrollPos1 === 0) {
                scrollPos2 = 0;
            }
            else if (scrollPos1 === maxScrollPos1) {
                scrollPos2 = maxScrollPos2;
            }
            else if (isRemove && targetPos <= scrollPos1) {
                var delta = Math.min(scrollPos1 - targetPos, size1 - size2);
                scrollPos2 = Math.min(scrollPos1 - delta, maxScrollPos2);
            }
            else if (targetPos <= scrollPos1) {
                scrollPos2 = Math.min(scrollPos1 + size2 - size1, maxScrollPos2);
            }
            else {
                scrollPos2 = scrollPos1;
            }
            // Update the scroll position and compute the paint offset.
            if (isRows) {
                this._scrollY = scrollPos2;
                offset = this.headerHeight;
            }
            else {
                this._scrollX = scrollPos2;
                offset = this.headerWidth;
            }
            // Adjust the paint offset if the scroll position did not change.
            if (scrollPos1 === scrollPos2) {
                offset = Math.max(offset, offset + targetPos - scrollPos1);
            }
        }
        // Compute the dirty area.
        var x = isRows ? 0 : offset;
        var y = isRows ? offset : 0;
        var w = this._viewportWidth - x;
        var h = this._viewportHeight - y;
        // Schedule a repaint of the dirty area, if needed.
        if (w > 0 && h > 0) {
            this.repaint(x, y, w, h);
        }
        // Sync the scroll state after queueing the repaint.
        this._syncScrollState();
    };
    /**
     * Handle sections moving in the data model.
     */
    DataGrid.prototype._onSectionsMoved = function (args) {
        // Unpack the arg data.
        var region = args.region, type = args.type, index = args.index, span = args.span, destination = args.destination;
        // Bail early if there are no sections to move.
        if (span <= 0) {
            return;
        }
        // Determine the behavior of the change type.
        var isRows = type === 'rows-moved';
        // Look up the relevant section list.
        var list;
        if (region === 'body') {
            list = isRows ? this._rowSections : this._columnSections;
        }
        else {
            list = isRows ? this._columnHeaderSections : this._rowHeaderSections;
        }
        // Bail early if the index is out of range.
        if (index < 0 || index >= list.sectionCount) {
            return;
        }
        // Clamp the move span to the limit.
        span = Math.min(span, list.sectionCount - index);
        // Clamp the destination index to the limit.
        destination = Math.min(Math.max(0, destination), list.sectionCount - span);
        // Bail early if there is no effective move.
        if (index === destination) {
            return;
        }
        // Compute the first affected index.
        var i1 = Math.min(index, destination);
        // Compute the last affected index.
        var i2 = Math.max(index + span - 1, destination + span - 1);
        // Compute the first paint boundary.
        var p1 = list.sectionOffset(i1);
        // Compute the last paint boundary.
        var p2;
        if (i2 >= list.sectionCount - 1) {
            p2 = list.totalSize - 1;
        }
        else {
            p2 = list.sectionOffset(i2 + 1) - 1;
        }
        // Move the sections in the list.
        list.moveSections(index, span, destination);
        // Fetch the row header and column header sizes.
        var hw = this.headerWidth;
        var hh = this.headerHeight;
        // Set up the initial paint limits.
        var xMin = 0;
        var yMin = 0;
        var xMax = this._viewportWidth - 1;
        var yMax = this._viewportHeight - 1;
        // Set up the initial paint region.
        var x1 = xMin;
        var y1 = yMin;
        var x2 = xMax;
        var y2 = yMax;
        // Adjust the limits and paint region.
        switch (region) {
            case 'body':
                if (isRows) {
                    yMin = hh;
                    y1 = hh + p1 - this._scrollY;
                    y2 = hh + p2 - this._scrollY;
                }
                else {
                    xMin = hw;
                    x1 = hw + p1 - this._scrollX;
                    x2 = hw + p2 - this._scrollX;
                }
                break;
            case 'row-header':
                xMax = Math.min(hw - 1, xMax);
                x1 = p1;
                x2 = p2;
                break;
            case 'column-header':
                yMax = Math.min(hh - 1, yMax);
                y1 = p1;
                y2 = p2;
                break;
            default:
                throw 'unreachable';
        }
        // Bail early if the paint limits are empty.
        if (xMax < xMin || yMax < yMin) {
            return;
        }
        // Bail early if the dirty region is out of range.
        if (x2 < xMin || x1 > xMax || y2 < yMin || y1 > yMax) {
            return;
        }
        // Compute the dirty area.
        var x = Math.max(xMin, x1);
        var y = Math.max(yMin, y1);
        var w = Math.min(x2, xMax) - x + 1;
        var h = Math.min(y2, yMax) - y + 1;
        // Schedule a repaint of the dirty area, if needed.
        if (w > 0 && h > 0) {
            this.repaint(x, y, w, h);
        }
    };
    /**
     * Handle cells changing in the data model.
     */
    DataGrid.prototype._onCellsChanged = function (args) {
        // Unpack the arg data.
        var region = args.region, rowIndex = args.rowIndex, columnIndex = args.columnIndex, rowSpan = args.rowSpan, columnSpan = args.columnSpan;
        // Bail early if there are no cells to modify.
        if (rowSpan <= 0 && columnSpan <= 0) {
            return;
        }
        // Look up the relevant row and column lists.
        var rList;
        var cList;
        switch (region) {
            case 'body':
                rList = this._rowSections;
                cList = this._columnSections;
                break;
            case 'row-header':
                rList = this._rowSections;
                cList = this._rowHeaderSections;
                break;
            case 'column-header':
                rList = this._columnHeaderSections;
                cList = this._columnSections;
                break;
            case 'corner-header':
                rList = this._columnHeaderSections;
                cList = this._rowHeaderSections;
                break;
            default:
                throw 'unreachable';
        }
        // Bail early if the changed cells are out of range.
        if (rowIndex >= rList.sectionCount || columnIndex >= cList.sectionCount) {
            return;
        }
        // Look up the unscrolled top-left corner of the range.
        var x1 = cList.sectionOffset(columnIndex);
        var y1 = rList.sectionOffset(rowIndex);
        // Look up the unscrolled bottom-right corner of the range.
        var x2;
        var y2;
        if (columnIndex + columnSpan >= cList.sectionCount) {
            x2 = cList.totalSize - 1;
        }
        else {
            x2 = cList.sectionOffset(columnIndex + columnSpan) - 1;
        }
        if (rowIndex + rowSpan >= rList.sectionCount) {
            y2 = rList.totalSize - 1;
        }
        else {
            y2 = rList.sectionOffset(rowIndex + rowSpan) - 1;
        }
        // Fetch the row header and column header sizes.
        var hw = this.headerWidth;
        var hh = this.headerHeight;
        // Set up the initial paint limits.
        var xMin = 0;
        var yMin = 0;
        var xMax = this._viewportWidth - 1;
        var yMax = this._viewportHeight - 1;
        // Adjust the limits and paint region.
        switch (region) {
            case 'body':
                xMin = hw;
                yMin = hh;
                x1 += hw - this._scrollX;
                x2 += hw - this._scrollX;
                y1 += hh - this._scrollY;
                y2 += hh - this._scrollY;
                break;
            case 'row-header':
                yMin = hh;
                xMax = Math.min(hw - 1, xMax);
                y1 += hh - this._scrollY;
                y2 += hh - this._scrollY;
                break;
            case 'column-header':
                xMin = hw;
                yMax = Math.min(hh - 1, yMax);
                x1 += hw - this._scrollX;
                x2 += hw - this._scrollX;
                break;
            case 'corner-header':
                xMax = Math.min(hw - 1, xMax);
                yMax = Math.min(hh - 1, yMax);
                break;
            default:
                throw 'unreachable';
        }
        // Bail early if the paint limits are empty.
        if (xMax < xMin || yMax < yMin) {
            return;
        }
        // Bail early if the dirty region is out of range.
        if (x2 < xMin || x1 > xMax || y2 < yMin || y1 > yMax) {
            return;
        }
        // Compute the dirty area.
        var x = Math.max(xMin, x1);
        var y = Math.max(yMin, y1);
        var w = Math.min(x2, xMax) - x + 1;
        var h = Math.min(y2, yMax) - y + 1;
        // Schedule a repaint of the dirty area, if needed.
        if (w > 0 && h > 0) {
            this.repaint(x, y, w, h);
        }
    };
    /**
     * Handle a full data model reset.
     */
    DataGrid.prototype._onModelReset = function (args) {
        // Look up the various current section counts.
        var nr = this._rowSections.sectionCount;
        var nc = this._columnSections.sectionCount;
        var nrh = this._rowHeaderSections.sectionCount;
        var nch = this._columnHeaderSections.sectionCount;
        // Compute the delta count for each region.
        var dr = this._model.rowCount('body') - nr;
        var dc = this._model.columnCount('body') - nc;
        var drh = this._model.columnCount('row-header') - nrh;
        var dch = this._model.rowCount('column-header') - nch;
        // Update the row sections, if needed.
        if (dr > 0) {
            this._rowSections.insertSections(nr, dr);
        }
        else if (dr < 0) {
            this._rowSections.removeSections(nr + dr, -dr);
        }
        // Update the column sections, if needed.
        if (dc > 0) {
            this._columnSections.insertSections(nc, dc);
        }
        else if (dc < 0) {
            this._columnSections.removeSections(nc + dc, -dc);
        }
        // Update the row header sections, if needed.
        if (drh > 0) {
            this._rowHeaderSections.insertSections(nrh, drh);
        }
        else if (drh < 0) {
            this._rowHeaderSections.removeSections(nrh + drh, -drh);
        }
        // Update the column header sections, if needed.
        if (dch > 0) {
            this._columnHeaderSections.insertSections(nch, dch);
        }
        else if (dch < 0) {
            this._columnHeaderSections.removeSections(nch + dch, -dch);
        }
        // Sync the viewport.
        this._syncViewport();
    };
    /**
     * A signal handler for the renderer map `changed` signal.
     */
    DataGrid.prototype._onRenderersChanged = function () {
        this.repaint();
    };
    /**
     * Blit content into the on-screen canvas.
     *
     * The rect should be expressed in viewport coordinates.
     *
     * This automatically accounts for the dpi ratio.
     */
    DataGrid.prototype._blit = function (source, x, y, w, h, dx, dy) {
        // Scale the blit coordinates by the dpi ratio.
        x *= this._dpiRatio;
        y *= this._dpiRatio;
        w *= this._dpiRatio;
        h *= this._dpiRatio;
        dx *= this._dpiRatio;
        dy *= this._dpiRatio;
        // Save the current gc state.
        this._canvasGC.save();
        // Set the transform to the identity matrix.
        this._canvasGC.setTransform(1, 0, 0, 1, 0, 0);
        // Draw the specified content.
        this._canvasGC.drawImage(source, x, y, w, h, dx, dy, w, h);
        // Restore the gc state.
        this._canvasGC.restore();
    };
    /**
     * Paint the grid content for the given dirty rect.
     *
     * The rect should be expressed in viewport coordinates.
     *
     * This is the primary paint entry point. The individual `_draw*`
     * methods should not be invoked directly. This method dispatches
     * to the drawing methods in the correct order.
     */
    DataGrid.prototype._paint = function (rx, ry, rw, rh) {
        // Warn and bail if recursive painting is detected.
        if (this._inPaint) {
            console.warn('Recursive paint detected.');
            return;
        }
        // Execute the actual drawing logic.
        try {
            this._inPaint = true;
            this._draw(rx, ry, rw, rh);
        }
        finally {
            this._inPaint = false;
        }
    };
    /**
     * Draw the grid content for the given dirty rect.
     *
     * This method dispatches to the relevant `_draw*` methods.
     */
    DataGrid.prototype._draw = function (rx, ry, rw, rh) {
        // Scale the canvas and buffer GC for the dpi ratio.
        this._canvasGC.setTransform(this._dpiRatio, 0, 0, this._dpiRatio, 0, 0);
        this._bufferGC.setTransform(this._dpiRatio, 0, 0, this._dpiRatio, 0, 0);
        // Clear the dirty rect of all content.
        this._canvasGC.clearRect(rx, ry, rw, rh);
        // Draw the void region.
        this._drawVoidRegion(rx, ry, rw, rh);
        // Draw the body region.
        this._drawBodyRegion(rx, ry, rw, rh);
        // Draw the row header region.
        this._drawRowHeaderRegion(rx, ry, rw, rh);
        // Draw the column header region.
        this._drawColumnHeaderRegion(rx, ry, rw, rh);
        // Draw the corner header region.
        this._drawCornerHeaderRegion(rx, ry, rw, rh);
    };
    /**
     * Draw the void region for the dirty rect.
     */
    DataGrid.prototype._drawVoidRegion = function (rx, ry, rw, rh) {
        // Look up the void color.
        var color = this._style.voidColor;
        // Bail if there is no void color.
        if (!color) {
            return;
        }
        // Fill the dirty rect with the void color.
        this._canvasGC.fillStyle = color;
        this._canvasGC.fillRect(rx, ry, rw, rh);
    };
    /**
     * Draw the body region which intersects the dirty rect.
     */
    DataGrid.prototype._drawBodyRegion = function (rx, ry, rw, rh) {
        // Get the visible content dimensions.
        var contentW = this._columnSections.totalSize - this._scrollX;
        var contentH = this._rowSections.totalSize - this._scrollY;
        // Bail if there is no content to draw.
        if (contentW <= 0 || contentH <= 0) {
            return;
        }
        // Get the visible content origin.
        var contentX = this.headerWidth;
        var contentY = this.headerHeight;
        // Bail if the dirty rect does not intersect the content area.
        if (rx + rw <= contentX) {
            return;
        }
        if (ry + rh <= contentY) {
            return;
        }
        if (rx >= contentX + contentW) {
            return;
        }
        if (ry >= contentY + contentH) {
            return;
        }
        // Get the upper and lower bounds of the dirty content area.
        var x1 = Math.max(rx, contentX);
        var y1 = Math.max(ry, contentY);
        var x2 = Math.min(rx + rw - 1, contentX + contentW - 1);
        var y2 = Math.min(ry + rh - 1, contentY + contentH - 1);
        // Convert the dirty content bounds into cell bounds.
        var r1 = this._rowSections.sectionIndex(y1 - contentY + this._scrollY);
        var c1 = this._columnSections.sectionIndex(x1 - contentX + this._scrollX);
        var r2 = this._rowSections.sectionIndex(y2 - contentY + this._scrollY);
        var c2 = this._columnSections.sectionIndex(x2 - contentX + this._scrollX);
        // Handle a dirty content area larger than the cell count.
        if (r2 < 0) {
            r2 = this._rowSections.sectionCount - 1;
        }
        if (c2 < 0) {
            c2 = this._columnSections.sectionCount - 1;
        }
        // Convert the cell bounds back to visible coordinates.
        var x = this._columnSections.sectionOffset(c1) + contentX - this._scrollX;
        var y = this._rowSections.sectionOffset(r1) + contentY - this._scrollY;
        // Set up the paint region size variables.
        var width = 0;
        var height = 0;
        // Allocate the section sizes arrays.
        var rowSizes = new Array(r2 - r1 + 1);
        var columnSizes = new Array(c2 - c1 + 1);
        // Get the row sizes for the region.
        for (var j = r1; j <= r2; ++j) {
            var size = this._rowSections.sectionSize(j);
            rowSizes[j - r1] = size;
            height += size;
        }
        // Get the column sizes for the region.
        for (var i = c1; i <= c2; ++i) {
            var size = this._columnSections.sectionSize(i);
            columnSizes[i - c1] = size;
            width += size;
        }
        // Create the paint region object.
        var rgn = {
            region: 'body',
            xMin: x1, yMin: y1,
            xMax: x2, yMax: y2,
            x: x, y: y, width: width, height: height,
            row: r1, column: c1,
            rowSizes: rowSizes, columnSizes: columnSizes
        };
        // Draw the background.
        this._drawBackground(rgn, this._style.backgroundColor);
        // Draw the row background.
        this._drawRowBackground(rgn, this._style.rowBackgroundColor);
        // Draw the column background.
        this._drawColumnBackground(rgn, this._style.columnBackgroundColor);
        // Draw the cell content for the paint region.
        this._drawCells(rgn);
        // Draw the horizontal grid lines.
        this._drawHorizontalGridLines(rgn, this._style.horizontalGridLineColor ||
            this._style.gridLineColor);
        // Draw the vertical grid lines.
        this._drawVerticalGridLines(rgn, this._style.verticalGridLineColor ||
            this._style.gridLineColor);
    };
    /**
     * Draw the row header region which intersects the dirty rect.
     */
    DataGrid.prototype._drawRowHeaderRegion = function (rx, ry, rw, rh) {
        // Get the visible content dimensions.
        var contentW = this.headerWidth;
        var contentH = this._rowSections.totalSize - this._scrollY;
        // Bail if there is no content to draw.
        if (contentW <= 0 || contentH <= 0) {
            return;
        }
        // Get the visible content origin.
        var contentX = 0;
        var contentY = this.headerHeight;
        // Bail if the dirty rect does not intersect the content area.
        if (rx + rw <= contentX) {
            return;
        }
        if (ry + rh <= contentY) {
            return;
        }
        if (rx >= contentX + contentW) {
            return;
        }
        if (ry >= contentY + contentH) {
            return;
        }
        // Get the upper and lower bounds of the dirty content area.
        var x1 = rx;
        var y1 = Math.max(ry, contentY);
        var x2 = Math.min(rx + rw - 1, contentX + contentW - 1);
        var y2 = Math.min(ry + rh - 1, contentY + contentH - 1);
        // Convert the dirty content bounds into cell bounds.
        var r1 = this._rowSections.sectionIndex(y1 - contentY + this._scrollY);
        var c1 = this._rowHeaderSections.sectionIndex(x1);
        var r2 = this._rowSections.sectionIndex(y2 - contentY + this._scrollY);
        var c2 = this._rowHeaderSections.sectionIndex(x2);
        // Handle a dirty content area larger than the cell count.
        if (r2 < 0) {
            r2 = this._rowSections.sectionCount - 1;
        }
        if (c2 < 0) {
            c2 = this._rowHeaderSections.sectionCount - 1;
        }
        // Convert the cell bounds back to visible coordinates.
        var x = this._rowHeaderSections.sectionOffset(c1);
        var y = this._rowSections.sectionOffset(r1) + contentY - this._scrollY;
        // Set up the paint region size variables.
        var width = 0;
        var height = 0;
        // Allocate the section sizes arrays.
        var rowSizes = new Array(r2 - r1 + 1);
        var columnSizes = new Array(c2 - c1 + 1);
        // Get the row sizes for the region.
        for (var j = r1; j <= r2; ++j) {
            var size = this._rowSections.sectionSize(j);
            rowSizes[j - r1] = size;
            height += size;
        }
        // Get the column sizes for the region.
        for (var i = c1; i <= c2; ++i) {
            var size = this._rowHeaderSections.sectionSize(i);
            columnSizes[i - c1] = size;
            width += size;
        }
        // Create the paint region object.
        var rgn = {
            region: 'row-header',
            xMin: x1, yMin: y1,
            xMax: x2, yMax: y2,
            x: x, y: y, width: width, height: height,
            row: r1, column: c1,
            rowSizes: rowSizes, columnSizes: columnSizes
        };
        // Draw the background.
        this._drawBackground(rgn, this._style.headerBackgroundColor);
        // Draw the cell content for the paint region.
        this._drawCells(rgn);
        // Draw the horizontal grid lines.
        this._drawHorizontalGridLines(rgn, this._style.headerHorizontalGridLineColor ||
            this._style.headerGridLineColor);
        // Draw the vertical grid lines.
        this._drawVerticalGridLines(rgn, this._style.headerVerticalGridLineColor ||
            this._style.headerGridLineColor);
    };
    /**
     * Draw the column header region which intersects the dirty rect.
     */
    DataGrid.prototype._drawColumnHeaderRegion = function (rx, ry, rw, rh) {
        // Get the visible content dimensions.
        var contentW = this._columnSections.totalSize - this._scrollX;
        var contentH = this.headerHeight;
        // Bail if there is no content to draw.
        if (contentW <= 0 || contentH <= 0) {
            return;
        }
        // Get the visible content origin.
        var contentX = this.headerWidth;
        var contentY = 0;
        // Bail if the dirty rect does not intersect the content area.
        if (rx + rw <= contentX) {
            return;
        }
        if (ry + rh <= contentY) {
            return;
        }
        if (rx >= contentX + contentW) {
            return;
        }
        if (ry >= contentY + contentH) {
            return;
        }
        // Get the upper and lower bounds of the dirty content area.
        var x1 = Math.max(rx, contentX);
        var y1 = ry;
        var x2 = Math.min(rx + rw - 1, contentX + contentW - 1);
        var y2 = Math.min(ry + rh - 1, contentY + contentH - 1);
        // Convert the dirty content bounds into cell bounds.
        var r1 = this._columnHeaderSections.sectionIndex(y1);
        var c1 = this._columnSections.sectionIndex(x1 - contentX + this._scrollX);
        var r2 = this._columnHeaderSections.sectionIndex(y2);
        var c2 = this._columnSections.sectionIndex(x2 - contentX + this._scrollX);
        // Handle a dirty content area larger than the cell count.
        if (r2 < 0) {
            r2 = this._columnHeaderSections.sectionCount - 1;
        }
        if (c2 < 0) {
            c2 = this._columnSections.sectionCount - 1;
        }
        // Convert the cell bounds back to visible coordinates.
        var x = this._columnSections.sectionOffset(c1) + contentX - this._scrollX;
        var y = this._columnHeaderSections.sectionOffset(r1);
        // Set up the paint region size variables.
        var width = 0;
        var height = 0;
        // Allocate the section sizes arrays.
        var rowSizes = new Array(r2 - r1 + 1);
        var columnSizes = new Array(c2 - c1 + 1);
        // Get the row sizes for the region.
        for (var j = r1; j <= r2; ++j) {
            var size = this._columnHeaderSections.sectionSize(j);
            rowSizes[j - r1] = size;
            height += size;
        }
        // Get the column sizes for the region.
        for (var i = c1; i <= c2; ++i) {
            var size = this._columnSections.sectionSize(i);
            columnSizes[i - c1] = size;
            width += size;
        }
        // Create the paint region object.
        var rgn = {
            region: 'column-header',
            xMin: x1, yMin: y1,
            xMax: x2, yMax: y2,
            x: x, y: y, width: width, height: height,
            row: r1, column: c1,
            rowSizes: rowSizes, columnSizes: columnSizes
        };
        // Draw the background.
        this._drawBackground(rgn, this._style.headerBackgroundColor);
        // Draw the cell content for the paint region.
        this._drawCells(rgn);
        // Draw the horizontal grid lines.
        this._drawHorizontalGridLines(rgn, this._style.headerHorizontalGridLineColor ||
            this._style.headerGridLineColor);
        // Draw the vertical grid lines.
        this._drawVerticalGridLines(rgn, this._style.headerVerticalGridLineColor ||
            this._style.headerGridLineColor);
    };
    /**
     * Draw the corner header region which intersects the dirty rect.
     */
    DataGrid.prototype._drawCornerHeaderRegion = function (rx, ry, rw, rh) {
        // Get the visible content dimensions.
        var contentW = this.headerWidth;
        var contentH = this.headerHeight;
        // Bail if there is no content to draw.
        if (contentW <= 0 || contentH <= 0) {
            return;
        }
        // Get the visible content origin.
        var contentX = 0;
        var contentY = 0;
        // Bail if the dirty rect does not intersect the content area.
        if (rx + rw <= contentX) {
            return;
        }
        if (ry + rh <= contentY) {
            return;
        }
        if (rx >= contentX + contentW) {
            return;
        }
        if (ry >= contentY + contentH) {
            return;
        }
        // Get the upper and lower bounds of the dirty content area.
        var x1 = rx;
        var y1 = ry;
        var x2 = Math.min(rx + rw - 1, contentX + contentW - 1);
        var y2 = Math.min(ry + rh - 1, contentY + contentH - 1);
        // Convert the dirty content bounds into cell bounds.
        var r1 = this._columnHeaderSections.sectionIndex(y1);
        var c1 = this._rowHeaderSections.sectionIndex(x1);
        var r2 = this._columnHeaderSections.sectionIndex(y2);
        var c2 = this._rowHeaderSections.sectionIndex(x2);
        // Handle a dirty content area larger than the cell count.
        if (r2 < 0) {
            r2 = this._columnHeaderSections.sectionCount - 1;
        }
        if (c2 < 0) {
            c2 = this._rowHeaderSections.sectionCount - 1;
        }
        // Convert the cell bounds back to visible coordinates.
        var x = this._rowHeaderSections.sectionOffset(c1);
        var y = this._columnHeaderSections.sectionOffset(r1);
        // Set up the paint region size variables.
        var width = 0;
        var height = 0;
        // Allocate the section sizes arrays.
        var rowSizes = new Array(r2 - r1 + 1);
        var columnSizes = new Array(c2 - c1 + 1);
        // Get the row sizes for the region.
        for (var j = r1; j <= r2; ++j) {
            var size = this._columnHeaderSections.sectionSize(j);
            rowSizes[j - r1] = size;
            height += size;
        }
        // Get the column sizes for the region.
        for (var i = c1; i <= c2; ++i) {
            var size = this._rowHeaderSections.sectionSize(i);
            columnSizes[i - c1] = size;
            width += size;
        }
        // Create the paint region object.
        var rgn = {
            region: 'corner-header',
            xMin: x1, yMin: y1,
            xMax: x2, yMax: y2,
            x: x, y: y, width: width, height: height,
            row: r1, column: c1,
            rowSizes: rowSizes, columnSizes: columnSizes
        };
        // Draw the background.
        this._drawBackground(rgn, this._style.headerBackgroundColor);
        // Draw the cell content for the paint region.
        this._drawCells(rgn);
        // Draw the horizontal grid lines.
        this._drawHorizontalGridLines(rgn, this._style.headerHorizontalGridLineColor ||
            this._style.headerGridLineColor);
        // Draw the vertical grid lines.
        this._drawVerticalGridLines(rgn, this._style.headerVerticalGridLineColor ||
            this._style.headerGridLineColor);
    };
    /**
     * Draw the background for the given paint region.
     */
    DataGrid.prototype._drawBackground = function (rgn, color) {
        // Bail if there is no color to draw.
        if (!color) {
            return;
        }
        // Unpack the region.
        var xMin = rgn.xMin, yMin = rgn.yMin, xMax = rgn.xMax, yMax = rgn.yMax;
        // Fill the region with the specified color.
        this._canvasGC.fillStyle = color;
        this._canvasGC.fillRect(xMin, yMin, xMax - xMin + 1, yMax - yMin + 1);
    };
    /**
     * Draw the row background for the given paint region.
     */
    DataGrid.prototype._drawRowBackground = function (rgn, colorFn) {
        // Bail if there is no color function.
        if (!colorFn) {
            return;
        }
        // Compute the X bounds for the row.
        var x1 = Math.max(rgn.xMin, rgn.x);
        var x2 = Math.min(rgn.x + rgn.width - 1, rgn.xMax);
        // Draw the background for the rows in the region.
        for (var y = rgn.y, j = 0, n = rgn.rowSizes.length; j < n; ++j) {
            // Fetch the size of the row.
            var size = rgn.rowSizes[j];
            // Skip zero sized rows.
            if (size === 0) {
                continue;
            }
            // Get the background color for the row.
            var color = colorFn(rgn.row + j);
            // Fill the row with the background color if needed.
            if (color) {
                var y1 = Math.max(rgn.yMin, y);
                var y2 = Math.min(y + size - 1, rgn.yMax);
                this._canvasGC.fillStyle = color;
                this._canvasGC.fillRect(x1, y1, x2 - x1 + 1, y2 - y1 + 1);
            }
            // Increment the running Y coordinate.
            y += size;
        }
    };
    /**
     * Draw the column background for the given paint region.
     */
    DataGrid.prototype._drawColumnBackground = function (rgn, colorFn) {
        // Bail if there is no color function.
        if (!colorFn) {
            return;
        }
        // Compute the Y bounds for the column.
        var y1 = Math.max(rgn.yMin, rgn.y);
        var y2 = Math.min(rgn.y + rgn.height - 1, rgn.yMax);
        // Draw the background for the columns in the region.
        for (var x = rgn.x, i = 0, n = rgn.columnSizes.length; i < n; ++i) {
            // Fetch the size of the column.
            var size = rgn.columnSizes[i];
            // Skip zero sized columns.
            if (size === 0) {
                continue;
            }
            // Get the background color for the column.
            var color = colorFn(rgn.column + i);
            // Fill the column with the background color if needed.
            if (color) {
                var x1 = Math.max(rgn.xMin, x);
                var x2 = Math.min(x + size - 1, rgn.xMax);
                this._canvasGC.fillStyle = color;
                this._canvasGC.fillRect(x1, y1, x2 - x1 + 1, y2 - y1 + 1);
            }
            // Increment the running X coordinate.
            x += size;
        }
    };
    /**
     * Draw the cells for the given paint region.
     */
    DataGrid.prototype._drawCells = function (rgn) {
        // Bail if there is no data model.
        if (!this._model) {
            return;
        }
        // Set up the cell config object for rendering.
        var config = {
            x: 0, y: 0, width: 0, height: 0,
            region: rgn.region, row: 0, column: 0,
            metadata: datamodel_1.DataModel.emptyMetadata, value: null
        };
        // Save the buffer gc before wrapping.
        this._bufferGC.save();
        // Wrap the buffer gc for painting the cells.
        var gc = new graphicscontext_1.GraphicsContext(this._bufferGC);
        // Compute the actual Y bounds for the cell range.
        var y1 = Math.max(rgn.yMin, rgn.y);
        var y2 = Math.min(rgn.y + rgn.height - 1, rgn.yMax);
        // Loop over the columns in the region.
        for (var x = rgn.x, i = 0, n = rgn.columnSizes.length; i < n; ++i) {
            // Fetch the size of the column.
            var width = rgn.columnSizes[i];
            // Skip zero sized columns.
            if (width === 0) {
                continue;
            }
            // Compute the column index.
            var column = rgn.column + i;
            // Get the metadata for the column.
            var metadata = void 0;
            try {
                metadata = this._model.metadata(rgn.region, column);
            }
            catch (err) {
                metadata = datamodel_1.DataModel.emptyMetadata;
                console.error(err);
            }
            // Update the config for the current column.
            config.x = x;
            config.width = width;
            config.column = column;
            config.metadata = metadata;
            // Clear the buffer rect for the column.
            gc.clearRect(x, rgn.y, width, rgn.height);
            // Save the GC state.
            gc.save();
            // Look up the renderer for the column.
            var renderer = (this._cellRenderers.get(rgn.region, metadata) || this._defaultRenderer);
            // Prepare the cell renderer for drawing the column.
            try {
                renderer.prepare(gc, config);
            }
            catch (err) {
                console.error(err);
            }
            // Loop over the rows in the column.
            for (var y = rgn.y, j = 0, n_1 = rgn.rowSizes.length; j < n_1; ++j) {
                // Fetch the size of the row.
                var height = rgn.rowSizes[j];
                // Skip zero sized rows.
                if (height === 0) {
                    continue;
                }
                // Compute the row index.
                var row = rgn.row + j;
                // Get the data value for the cell.
                var value = void 0;
                try {
                    value = this._model.data(rgn.region, row, column);
                }
                catch (err) {
                    value = undefined;
                    console.error(err);
                }
                // Update the config for the current cell.
                config.y = y;
                config.height = height;
                config.row = row;
                config.value = value;
                // Save the GC state.
                gc.save();
                // Paint the cell into the off-screen buffer.
                try {
                    renderer.paint(gc, config);
                }
                catch (err) {
                    console.error(err);
                }
                // Restore the GC state.
                gc.restore();
                // Increment the running Y coordinate.
                y += height;
            }
            // Restore the GC state.
            gc.restore();
            // Compute the actual X bounds for the column.
            var x1 = Math.max(rgn.xMin, x);
            var x2 = Math.min(x + width - 1, rgn.xMax);
            // Blit the off-screen buffer column into the on-screen canvas.
            //
            // This is *much* faster than drawing directly into the on-screen
            // canvas with a clip rect on the column. Managed column clipping
            // is required to prevent cell renderers from needing to set up a
            // clip rect for handling horizontal overflow text (slow!).
            this._blit(this._buffer, x1, y1, x2 - x1 + 1, y2 - y1 + 1, x1, y1);
            // Increment the running X coordinate.
            x += width;
        }
        // Dispose of the wrapped gc.
        gc.dispose();
        // Restore the final buffer gc state.
        this._bufferGC.restore();
    };
    /**
     * Draw the horizontal grid lines for the given paint region.
     */
    DataGrid.prototype._drawHorizontalGridLines = function (rgn, color) {
        // Bail if there is no color to draw.
        if (!color) {
            return;
        }
        // Compute the X bounds for the horizontal lines.
        var x1 = Math.max(rgn.xMin, rgn.x);
        var x2 = Math.min(rgn.x + rgn.width, rgn.xMax + 1);
        // Begin the path for the grid lines.
        this._canvasGC.beginPath();
        // Set the line width for the grid lines.
        this._canvasGC.lineWidth = 1;
        // Draw the horizontal grid lines.
        for (var y = rgn.y, j = 0, n = rgn.rowSizes.length; j < n; ++j) {
            // Fetch the size of the row.
            var size = rgn.rowSizes[j];
            // Skip zero sized rows.
            if (size === 0) {
                continue;
            }
            // Compute the Y position of the line.
            var pos = y + size - 1;
            // Draw the line if it's in range of the dirty rect.
            if (pos >= rgn.yMin && pos <= rgn.yMax) {
                this._canvasGC.moveTo(x1, pos + 0.5);
                this._canvasGC.lineTo(x2, pos + 0.5);
            }
            // Increment the running Y coordinate.
            y += size;
        }
        // Stroke the lines with the specified color.
        this._canvasGC.strokeStyle = color;
        this._canvasGC.stroke();
    };
    /**
     * Draw the vertical grid lines for the given paint region.
     */
    DataGrid.prototype._drawVerticalGridLines = function (rgn, color) {
        // Bail if there is no color to draw.
        if (!color) {
            return;
        }
        // Compute the Y bounds for the vertical lines.
        var y1 = Math.max(rgn.yMin, rgn.y);
        var y2 = Math.min(rgn.y + rgn.height, rgn.yMax + 1);
        // Begin the path for the grid lines
        this._canvasGC.beginPath();
        // Set the line width for the grid lines.
        this._canvasGC.lineWidth = 1;
        // Draw the vertical grid lines.
        for (var x = rgn.x, i = 0, n = rgn.columnSizes.length; i < n; ++i) {
            // Fetch the size of the column.
            var size = rgn.columnSizes[i];
            // Skip zero sized columns.
            if (size === 0) {
                continue;
            }
            // Compute the X position of the line.
            var pos = x + size - 1;
            // Draw the line if it's in range of the dirty rect.
            if (pos >= rgn.xMin && pos <= rgn.xMax) {
                this._canvasGC.moveTo(pos + 0.5, y1);
                this._canvasGC.lineTo(pos + 0.5, y2);
            }
            // Increment the running X coordinate.
            x += size;
        }
        // Stroke the lines with the specified color.
        this._canvasGC.strokeStyle = color;
        this._canvasGC.stroke();
    };
    return DataGrid;
}(widgets_1.Widget));
exports.DataGrid = DataGrid;
/**
 * The namespace for the `DataGrid` class statics.
 */
(function (DataGrid) {
    /**
     * The default theme for a data grid.
     */
    DataGrid.defaultStyle = {
        voidColor: '#F3F3F3',
        backgroundColor: '#FFFFFF',
        gridLineColor: 'rgba(20, 20, 20, 0.15)',
        headerBackgroundColor: '#F3F3F3',
        headerGridLineColor: 'rgba(20, 20, 20, 0.25)'
    };
})(DataGrid = exports.DataGrid || (exports.DataGrid = {}));
exports.DataGrid = DataGrid;
/**
 * The namespace for the module implementation details.
 */
var Private;
(function (Private) {
    /**
     * A singleton `scroll-request` conflatable message.
     */
    Private.ScrollRequest = new messaging_1.ConflatableMessage('scroll-request');
    /**
     * A singleton `section-resize-request` conflatable message.
     */
    Private.SectionResizeRequest = new messaging_1.ConflatableMessage('section-resize-request');
    /**
     * Create a new zero-sized canvas element.
     */
    function createCanvas() {
        var canvas = document.createElement('canvas');
        canvas.width = 0;
        canvas.height = 0;
        return canvas;
    }
    Private.createCanvas = createCanvas;
    /**
     * A conflatable message which merges dirty paint rects.
     */
    var PaintRequest = /** @class */ (function (_super) {
        __extends(PaintRequest, _super);
        /**
         * Construct a new paint request messages.
         *
         * @param x1 - The top-left X coordinate of the rect.
         *
         * @param y1 - The top-left Y coordinate of the rect.
         *
         * @param x2 - The bottom-right X coordinate of the rect.
         *
         * @param y2 - The bottom-right Y coordinate of the rect.
         */
        function PaintRequest(x1, y1, x2, y2) {
            var _this = _super.call(this, 'paint-request') || this;
            _this._x1 = x1;
            _this._y1 = y1;
            _this._x2 = Math.max(x1, x2);
            _this._y2 = Math.max(y1, y2);
            return _this;
        }
        Object.defineProperty(PaintRequest.prototype, "x1", {
            /**
             * The top-left X coordinate of the rect.
             */
            get: function () {
                return this._x1;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PaintRequest.prototype, "y1", {
            /**
             * The top-left Y coordinate of the rect.
             */
            get: function () {
                return this._y1;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PaintRequest.prototype, "x2", {
            /**
             * The bottom-right X coordinate of the rect.
             */
            get: function () {
                return this._x2;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PaintRequest.prototype, "y2", {
            /**
             * The bottom-right Y coordinate of the rect.
             */
            get: function () {
                return this._y2;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * Conflate this message with another paint request.
         */
        PaintRequest.prototype.conflate = function (other) {
            this._x1 = Math.min(this._x1, other._x1);
            this._y1 = Math.min(this._y1, other._y1);
            this._x2 = Math.max(this._x2, other._x2);
            this._y2 = Math.max(this._y2, other._y2);
            return true;
        };
        return PaintRequest;
    }(messaging_1.ConflatableMessage));
    Private.PaintRequest = PaintRequest;
    /**
     * Find the index of the resize handle at the given position.
     *
     * This accounts for `3px` of space on either side of a grid line,
     * for a total of `7px` handle width.
     *
     * Returns the `{ index, delta }` match or `null`.
     */
    function findResizeIndex(list, pos) {
        // Bail early if the list is empty or the position is invalid.
        if (list.sectionCount === 0 || pos < 0) {
            return null;
        }
        // Compute the delta from the end of the list.
        var d1 = pos - (list.totalSize - 1);
        // Bail if the position is out of range.
        if (d1 > 3) {
            return null;
        }
        // Test whether the hover is just past the last section.
        if (d1 >= 0) {
            return { index: list.sectionCount - 1, delta: d1 };
        }
        // Find the section at the given position.
        var i = list.sectionIndex(pos);
        // Look up the offset for the section.
        var offset = list.sectionOffset(i);
        // Compute the delta to the previous border.
        var d2 = pos - (offset - 1);
        // Test whether the position hovers the previous border.
        if (i > 0 && d2 <= 3) {
            return { index: i - 1, delta: d2 };
        }
        // Look up the size of the section.
        var size = list.sectionSize(i);
        // Compute the delta to the next border.
        var d3 = (size + offset - 1) - pos;
        // Test whether the position hovers the section border.
        if (d3 <= 3) {
            return { index: i, delta: -d3 };
        }
        // Otherwise, no resize border is hovered.
        return null;
    }
    Private.findResizeIndex = findResizeIndex;
    /**
     * Get the cursor to use for a resize handle.
     */
    function cursorForHandle(handle) {
        return handle ? cursorMap[handle.type] : '';
    }
    Private.cursorForHandle = cursorForHandle;
    /**
     * A mapping of resize handle types to cursor values.
     */
    var cursorMap = {
        'body-row': 'ns-resize',
        'body-column': 'ew-resize',
        'header-row': 'ns-resize',
        'header-column': 'ew-resize'
    };
})(Private || (Private = {}));
