"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2017, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
var signaling_1 = require("@phosphor/signaling");
/**
 * An object which provides the data for a data grid.
 *
 * #### Notes
 * If the predefined data models are insufficient for a particular use
 * case, a custom model can be defined which derives from this class.
 */
var DataModel = /** @class */ (function () {
    function DataModel() {
        this._changed = new signaling_1.Signal(this);
    }
    Object.defineProperty(DataModel.prototype, "changed", {
        /**
         * A signal emitted when the data model has changed.
         */
        get: function () {
            return this._changed;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Get the metadata for a column in the data model.
     *
     * @param region - The cell region of interest.
     *
     * @param column - The index of the column of interest.
     *
     * @returns The metadata for the column.
     *
     * #### Notes
     * The returned metadata should be treated as immutable.
     *
     * Models which support columnar data may reimplement this method to
     * return the metadata for a column.
     *
     * The metadata can be used by custom cell renderers and cell editors
     * to customize handling of specific cell data types.
     *
     * This method is called often, and so should be efficient.
     *
     * The default implementation returns `{}`.
     */
    DataModel.prototype.metadata = function (region, column) {
        return DataModel.emptyMetadata;
    };
    /**
     * Emit the `changed` signal for the data model.
     *
     * #### Notes
     * Subclass should call this method whenever the data model has
     * changed so that attached data grids can update themselves.
     */
    DataModel.prototype.emitChanged = function (args) {
        this._changed.emit(args);
    };
    return DataModel;
}());
exports.DataModel = DataModel;
/**
 * The namespace for the `DataModel` class statics.
 */
(function (DataModel) {
    /**
     * A singleton empty metadata object.
     */
    DataModel.emptyMetadata = Object.freeze({});
})(DataModel = exports.DataModel || (exports.DataModel = {}));
exports.DataModel = DataModel;
