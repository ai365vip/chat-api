export const DEFAULT_SHAPE_SIZE = 10;

export const DEFAULT_SHAPE_SPACE = 8;

export const DEFAULT_LABEL_SPACE = 8;

export const DEFAULT_VALUE_SPACE = 8;

export const DEFAULT_ITEM_SPACE_COL = 16;

export const DEFAULT_ITEM_SPACE_ROW = 8;

export const DEFAULT_TITLE_SPACE = 12;

export const DEFAULT_PAGER_SPACE = 12;

export var LegendStateValue;

!function(LegendStateValue) {
    LegendStateValue.selected = "selected", LegendStateValue.unSelected = "unSelected", 
    LegendStateValue.selectedHover = "selectedHover", LegendStateValue.unSelectedHover = "unSelectedHover", 
    LegendStateValue.focus = "focus";
}(LegendStateValue || (LegendStateValue = {}));

export var LegendEvent;

!function(LegendEvent) {
    LegendEvent.legendItemHover = "legendItemHover", LegendEvent.legendItemUnHover = "legendItemUnHover", 
    LegendEvent.legendItemClick = "legendItemClick", LegendEvent.legendItemAttributeUpdate = "legendItemAttributeUpdate";
}(LegendEvent || (LegendEvent = {}));

export var LEGEND_ELEMENT_NAME;

!function(LEGEND_ELEMENT_NAME) {
    LEGEND_ELEMENT_NAME.innerView = "innerView", LEGEND_ELEMENT_NAME.title = "legendTitle", 
    LEGEND_ELEMENT_NAME.item = "legendItem", LEGEND_ELEMENT_NAME.itemShape = "legendItemShape", 
    LEGEND_ELEMENT_NAME.itemLabel = "legendItemLabel", LEGEND_ELEMENT_NAME.itemValue = "legendItemValue", 
    LEGEND_ELEMENT_NAME.focus = "legendItemFocus";
}(LEGEND_ELEMENT_NAME || (LEGEND_ELEMENT_NAME = {}));
//# sourceMappingURL=constant.js.map
