"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * An object which renders the cells of a data grid.
 *
 * #### Notes
 * If the predefined cell renderers are insufficient for a particular
 * use case, a custom cell renderer can be defined which derives from
 * this class.
 *
 * The data grid renders cells in column-major order, by region. The
 * region order is: body, row header, column header, corner header.
 */
var CellRenderer = /** @class */ (function () {
    function CellRenderer() {
    }
    /**
     * Prepare the graphics context for drawing a column of cells.
     *
     * @param gc - The graphics context to prepare.
     *
     * @param config - The configuration data for the column.
     *
     * #### Notes
     * This method is called just before the grid renders the cells in
     * a column. It allows the renderer an opportunity to set defaults
     * on the `gc` or pre-compute column render state. This can reduce
     * the need for costly `gc` state changes when painting each cell.
     *
     * The renderer **must not** draw to the `gc` in this method.
     *
     * The default implementation is a no-op.
     */
    CellRenderer.prototype.prepare = function (gc, config) { };
    return CellRenderer;
}());
exports.CellRenderer = CellRenderer;
/**
 * The namespace for the `CellRenderer` class statics.
 */
(function (CellRenderer) {
    /**
     * Resolve a config option for a cell renderer.
     *
     * @param option - The config option to resolve.
     *
     * @param config - The cell config object.
     *
     * @returns The resolved value for the option.
     */
    function resolveOption(option, config) {
        return typeof option === 'function' ? option(config) : option;
    }
    CellRenderer.resolveOption = resolveOption;
})(CellRenderer = exports.CellRenderer || (exports.CellRenderer = {}));
exports.CellRenderer = CellRenderer;
