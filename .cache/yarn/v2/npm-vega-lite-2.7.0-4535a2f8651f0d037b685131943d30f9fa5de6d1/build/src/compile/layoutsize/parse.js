"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var scale_1 = require("../../scale");
var vega_schema_1 = require("../../vega.schema");
var split_1 = require("../split");
function parseLayerLayoutSize(model) {
    parseChildrenLayoutSize(model);
    var layoutSizeCmpt = model.component.layoutSize;
    layoutSizeCmpt.setWithExplicit('width', parseNonUnitLayoutSizeForChannel(model, 'width'));
    layoutSizeCmpt.setWithExplicit('height', parseNonUnitLayoutSizeForChannel(model, 'height'));
}
exports.parseLayerLayoutSize = parseLayerLayoutSize;
exports.parseRepeatLayoutSize = parseLayerLayoutSize;
function parseConcatLayoutSize(model) {
    parseChildrenLayoutSize(model);
    var layoutSizeCmpt = model.component.layoutSize;
    var sizeTypeToMerge = model.isVConcat ? 'width' : 'height';
    layoutSizeCmpt.setWithExplicit(sizeTypeToMerge, parseNonUnitLayoutSizeForChannel(model, sizeTypeToMerge));
}
exports.parseConcatLayoutSize = parseConcatLayoutSize;
function parseChildrenLayoutSize(model) {
    for (var _i = 0, _a = model.children; _i < _a.length; _i++) {
        var child = _a[_i];
        child.parseLayoutSize();
    }
}
exports.parseChildrenLayoutSize = parseChildrenLayoutSize;
function parseNonUnitLayoutSizeForChannel(model, sizeType) {
    var channel = sizeType === 'width' ? 'x' : 'y';
    var resolve = model.component.resolve;
    var mergedSize;
    // Try to merge layout size
    for (var _i = 0, _a = model.children; _i < _a.length; _i++) {
        var child = _a[_i];
        var childSize = child.component.layoutSize.getWithExplicit(sizeType);
        var scaleResolve = resolve.scale[channel];
        if (scaleResolve === 'independent' && childSize.value === 'range-step') {
            // Do not merge independent scales with range-step as their size depends
            // on the scale domains, which can be different between scales.
            mergedSize = undefined;
            break;
        }
        if (mergedSize) {
            if (scaleResolve === 'independent' && mergedSize.value !== childSize.value) {
                // For independent scale, only merge if all the sizes are the same.
                // If the values are different, abandon the merge!
                mergedSize = undefined;
                break;
            }
            mergedSize = split_1.mergeValuesWithExplicit(mergedSize, childSize, sizeType, '');
        }
        else {
            mergedSize = childSize;
        }
    }
    if (mergedSize) {
        // If merged, rename size and set size of all children.
        for (var _b = 0, _c = model.children; _b < _c.length; _b++) {
            var child = _c[_b];
            model.renameLayoutSize(child.getName(sizeType), model.getName(sizeType));
            child.component.layoutSize.set(sizeType, 'merged', false);
        }
        return mergedSize;
    }
    else {
        // Otherwise, there is no merged size.
        return {
            explicit: false,
            value: undefined
        };
    }
}
function parseUnitLayoutSize(model) {
    var layoutSizeComponent = model.component.layoutSize;
    if (!layoutSizeComponent.explicit.width) {
        var width = defaultUnitSize(model, 'width');
        layoutSizeComponent.set('width', width, false);
    }
    if (!layoutSizeComponent.explicit.height) {
        var height = defaultUnitSize(model, 'height');
        layoutSizeComponent.set('height', height, false);
    }
}
exports.parseUnitLayoutSize = parseUnitLayoutSize;
function defaultUnitSize(model, sizeType) {
    var channel = sizeType === 'width' ? 'x' : 'y';
    var config = model.config;
    var scaleComponent = model.getScaleComponent(channel);
    if (scaleComponent) {
        var scaleType = scaleComponent.get('type');
        var range = scaleComponent.get('range');
        if (scale_1.hasDiscreteDomain(scaleType) && vega_schema_1.isVgRangeStep(range)) {
            // For discrete domain with range.step, use dynamic width/height
            return 'range-step';
        }
        else {
            return config.view[sizeType];
        }
    }
    else if (model.hasProjection) {
        return config.view[sizeType];
    }
    else {
        // No scale - set default size
        if (sizeType === 'width' && model.mark === 'text') {
            // width for text mark without x-field is a bit wider than typical range step
            return config.scale.textXRangeStep;
        }
        // Set width/height equal to rangeStep config or if rangeStep is null, use value from default scale config.
        return config.scale.rangeStep || scale_1.defaultScaleConfig.rangeStep;
    }
}
//# sourceMappingURL=parse.js.map