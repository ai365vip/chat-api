import { isString, merge, mixin } from "@visactor/vutils";

import { ScrollBar as ScrollbarComponent } from "@visactor/vrender-components";

import { ComponentEnum, GrammarMarkType } from "../graph/enums";

import { invokeEncoder } from "../graph/mark/encode";

import { invokeFunctionType } from "../parse/util";

import { Factory } from "../core/factory";

import { ScaleComponent } from "./scale";

import { ScrollbarFilter } from "../interactions/scrollbar-filter";

import { Filter, FilterMixin } from "../interactions/filter";

import { isHorizontal, isHorizontalPosition, isValidDirection, isValidPosition, isVertical } from "@visactor/vgrammar-util";

export const generateScrollbarAttributes = (groupSize, direction, position, theme, addition) => {
    var _a, _b, _c, _d, _e;
    const scrollbarTheme = null === (_a = null == theme ? void 0 : theme.components) || void 0 === _a ? void 0 : _a.scrollbar;
    let finalDirection = "horizontal", finalPosition = "bottom";
    isValidDirection(direction) || isValidPosition(position) ? !isValidDirection(direction) && isValidPosition(position) ? (finalDirection = isHorizontalPosition(position) ? "horizontal" : "vertical", 
    finalPosition = position) : isValidDirection(direction) && !isValidPosition(position) ? (finalDirection = direction, 
    finalPosition = isHorizontal(direction) ? "bottom" : "right") : (finalDirection = direction, 
    finalPosition = isHorizontal(direction) && !isHorizontalPosition(position) ? "bottom" : isVertical(direction) && isHorizontalPosition(position) ? "right" : position) : (finalDirection = "horizontal", 
    finalPosition = "bottom");
    const attributes = {
        direction: finalDirection
    };
    if (isHorizontal(finalDirection)) {
        const size = null !== (_c = null !== (_b = addition.height) && void 0 !== _b ? _b : null == scrollbarTheme ? void 0 : scrollbarTheme.height) && void 0 !== _c ? _c : 12;
        "top" === finalPosition ? Object.assign(attributes, {
            width: groupSize.width,
            height: size,
            x: 0,
            y: 0
        }) : Object.assign(attributes, {
            width: groupSize.width,
            height: size,
            x: 0,
            y: groupSize.height - size
        });
    } else {
        const size = null !== (_e = null !== (_d = addition.width) && void 0 !== _d ? _d : null == scrollbarTheme ? void 0 : scrollbarTheme.width) && void 0 !== _e ? _e : 12;
        "left" === finalPosition ? Object.assign(attributes, {
            width: size,
            height: groupSize.height,
            x: 0,
            y: 0
        }) : Object.assign(attributes, {
            width: size,
            height: groupSize.height,
            x: groupSize.width - size,
            y: 0
        });
    }
    return merge({}, scrollbarTheme, attributes, null != addition ? addition : {});
};

export class Scrollbar extends ScaleComponent {
    constructor(view, group) {
        super(view, ComponentEnum.scrollbar, group), this.spec.componentType = ComponentEnum.scrollbar;
    }
    parseAddition(spec) {
        return super.parseAddition(spec), this.container(spec.container), this.direction(spec.direction), 
        this.position(spec.position), this;
    }
    container(container) {
        if (this.spec.container) {
            const prevContainer = isString(this.spec.container) ? this.view.getMarkById(this.spec.container) : this.spec.container;
            this.detach(prevContainer);
        }
        if (this.spec.container = container, container) {
            const nextContainer = isString(container) ? this.view.getMarkById(container) : container;
            this.attach(nextContainer);
        }
        return this.commit(), this;
    }
    direction(direction) {
        return this.setFunctionSpec(direction, "direction");
    }
    position(position) {
        return this.setFunctionSpec(position, "position");
    }
    setScrollStart(start) {
        var _a;
        const scrollbar = this.getGroupGraphicItem(), range = null === (_a = null == scrollbar ? void 0 : scrollbar.attribute) || void 0 === _a ? void 0 : _a.range;
        if (scrollbar && range) {
            const nextRange = [ start, range[1] - range[0] + start ];
            scrollbar.setScrollRange(nextRange);
        }
        return this;
    }
    getScrollRange() {
        const scrollbar = this.getGroupGraphicItem();
        if (scrollbar) return scrollbar.getScrollRange();
    }
    addGraphicItem(attrs, groupKey) {
        const initialAttributes = merge({
            range: [ 0, 1 ]
        }, attrs), graphicItem = Factory.createGraphicComponent(ComponentEnum.scrollbar, initialAttributes, {
            skipDefault: this.spec.skipTheme
        });
        return super.addGraphicItem(initialAttributes, groupKey, graphicItem);
    }
    _updateComponentEncoders() {
        const encoders = Object.assign({
            update: {}
        }, this.spec.encode), componentEncoders = Object.keys(encoders).reduce(((res, state) => {
            const encoder = encoders[state];
            return encoder && (res[state] = {
                callback: (datum, element, parameters) => {
                    var _a, _b;
                    const theme = this.spec.skipTheme ? null : this.view.getCurrentTheme(), direction = invokeFunctionType(this.spec.direction, parameters, datum, element), position = invokeFunctionType(this.spec.position, parameters, datum, element), addition = invokeEncoder(encoder, datum, element, parameters), targetMark = this.spec.container ? isString(this.spec.container) ? this.view.getMarkById(this.spec.container) : this.spec.container : null, groupGraphicItem = (targetMark && targetMark.markType === GrammarMarkType.group ? targetMark : this.group).getGroupGraphicItem(), size = groupGraphicItem ? {
                        width: null !== (_a = groupGraphicItem.attribute.width) && void 0 !== _a ? _a : groupGraphicItem.AABBBounds.width(),
                        height: null !== (_b = groupGraphicItem.attribute.height) && void 0 !== _b ? _b : groupGraphicItem.AABBBounds.height()
                    } : {
                        width: this.view.width(),
                        height: this.view.height()
                    };
                    return generateScrollbarAttributes(size, direction, position, theme, addition);
                }
            }), res;
        }), {});
        this._encoders = componentEncoders;
    }
}

Scrollbar.componentType = ComponentEnum.scrollbar;

export const registerScrollbar = () => {
    Factory.registerGraphicComponent(ComponentEnum.scrollbar, (attrs => new ScrollbarComponent(attrs))), 
    Factory.registerComponent(ComponentEnum.scrollbar, Scrollbar), mixin(Filter, FilterMixin), 
    Factory.registerInteraction(ScrollbarFilter.type, ScrollbarFilter);
};
//# sourceMappingURL=scrollbar.js.map