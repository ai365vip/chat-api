"use strict";

var LegendStateValue, LegendEvent, LEGEND_ELEMENT_NAME;

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.LEGEND_ELEMENT_NAME = exports.LegendEvent = exports.LegendStateValue = exports.DEFAULT_PAGER_SPACE = exports.DEFAULT_TITLE_SPACE = exports.DEFAULT_ITEM_SPACE_ROW = exports.DEFAULT_ITEM_SPACE_COL = exports.DEFAULT_VALUE_SPACE = exports.DEFAULT_LABEL_SPACE = exports.DEFAULT_SHAPE_SPACE = exports.DEFAULT_SHAPE_SIZE = void 0, 
exports.DEFAULT_SHAPE_SIZE = 10, exports.DEFAULT_SHAPE_SPACE = 8, exports.DEFAULT_LABEL_SPACE = 8, 
exports.DEFAULT_VALUE_SPACE = 8, exports.DEFAULT_ITEM_SPACE_COL = 16, exports.DEFAULT_ITEM_SPACE_ROW = 8, 
exports.DEFAULT_TITLE_SPACE = 12, exports.DEFAULT_PAGER_SPACE = 12, function(LegendStateValue) {
    LegendStateValue.selected = "selected", LegendStateValue.unSelected = "unSelected", 
    LegendStateValue.selectedHover = "selectedHover", LegendStateValue.unSelectedHover = "unSelectedHover", 
    LegendStateValue.focus = "focus";
}(LegendStateValue = exports.LegendStateValue || (exports.LegendStateValue = {})), 
function(LegendEvent) {
    LegendEvent.legendItemHover = "legendItemHover", LegendEvent.legendItemUnHover = "legendItemUnHover", 
    LegendEvent.legendItemClick = "legendItemClick", LegendEvent.legendItemAttributeUpdate = "legendItemAttributeUpdate";
}(LegendEvent = exports.LegendEvent || (exports.LegendEvent = {})), function(LEGEND_ELEMENT_NAME) {
    LEGEND_ELEMENT_NAME.innerView = "innerView", LEGEND_ELEMENT_NAME.title = "legendTitle", 
    LEGEND_ELEMENT_NAME.item = "legendItem", LEGEND_ELEMENT_NAME.itemShape = "legendItemShape", 
    LEGEND_ELEMENT_NAME.itemLabel = "legendItemLabel", LEGEND_ELEMENT_NAME.itemValue = "legendItemValue", 
    LEGEND_ELEMENT_NAME.focus = "legendItemFocus";
}(LEGEND_ELEMENT_NAME = exports.LEGEND_ELEMENT_NAME || (exports.LEGEND_ELEMENT_NAME = {}));
//# sourceMappingURL=constant.js.map
