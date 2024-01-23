"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.registerScrollbar = exports.Scrollbar = exports.generateScrollbarAttributes = void 0;

const vutils_1 = require("@visactor/vutils"), vrender_components_1 = require("@visactor/vrender-components"), enums_1 = require("../graph/enums"), encode_1 = require("../graph/mark/encode"), util_1 = require("../parse/util"), factory_1 = require("../core/factory"), scale_1 = require("./scale"), scrollbar_filter_1 = require("../interactions/scrollbar-filter"), filter_1 = require("../interactions/filter"), vgrammar_util_1 = require("@visactor/vgrammar-util"), generateScrollbarAttributes = (groupSize, direction, position, theme, addition) => {
    var _a, _b, _c, _d, _e;
    const scrollbarTheme = null === (_a = null == theme ? void 0 : theme.components) || void 0 === _a ? void 0 : _a.scrollbar;
    let finalDirection = "horizontal", finalPosition = "bottom";
    (0, vgrammar_util_1.isValidDirection)(direction) || (0, vgrammar_util_1.isValidPosition)(position) ? !(0, 
    vgrammar_util_1.isValidDirection)(direction) && (0, vgrammar_util_1.isValidPosition)(position) ? (finalDirection = (0, 
    vgrammar_util_1.isHorizontalPosition)(position) ? "horizontal" : "vertical", finalPosition = position) : (0, 
    vgrammar_util_1.isValidDirection)(direction) && !(0, vgrammar_util_1.isValidPosition)(position) ? (finalDirection = direction, 
    finalPosition = (0, vgrammar_util_1.isHorizontal)(direction) ? "bottom" : "right") : (finalDirection = direction, 
    finalPosition = (0, vgrammar_util_1.isHorizontal)(direction) && !(0, vgrammar_util_1.isHorizontalPosition)(position) ? "bottom" : (0, 
    vgrammar_util_1.isVertical)(direction) && (0, vgrammar_util_1.isHorizontalPosition)(position) ? "right" : position) : (finalDirection = "horizontal", 
    finalPosition = "bottom");
    const attributes = {
        direction: finalDirection
    };
    if ((0, vgrammar_util_1.isHorizontal)(finalDirection)) {
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
    return (0, vutils_1.merge)({}, scrollbarTheme, attributes, null != addition ? addition : {});
};

exports.generateScrollbarAttributes = generateScrollbarAttributes;

class Scrollbar extends scale_1.ScaleComponent {
    constructor(view, group) {
        super(view, enums_1.ComponentEnum.scrollbar, group), this.spec.componentType = enums_1.ComponentEnum.scrollbar;
    }
    parseAddition(spec) {
        return super.parseAddition(spec), this.container(spec.container), this.direction(spec.direction), 
        this.position(spec.position), this;
    }
    container(container) {
        if (this.spec.container) {
            const prevContainer = (0, vutils_1.isString)(this.spec.container) ? this.view.getMarkById(this.spec.container) : this.spec.container;
            this.detach(prevContainer);
        }
        if (this.spec.container = container, container) {
            const nextContainer = (0, vutils_1.isString)(container) ? this.view.getMarkById(container) : container;
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
        const initialAttributes = (0, vutils_1.merge)({
            range: [ 0, 1 ]
        }, attrs), graphicItem = factory_1.Factory.createGraphicComponent(enums_1.ComponentEnum.scrollbar, initialAttributes, {
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
                    const theme = this.spec.skipTheme ? null : this.view.getCurrentTheme(), direction = (0, 
                    util_1.invokeFunctionType)(this.spec.direction, parameters, datum, element), position = (0, 
                    util_1.invokeFunctionType)(this.spec.position, parameters, datum, element), addition = (0, 
                    encode_1.invokeEncoder)(encoder, datum, element, parameters), targetMark = this.spec.container ? (0, 
                    vutils_1.isString)(this.spec.container) ? this.view.getMarkById(this.spec.container) : this.spec.container : null, groupGraphicItem = (targetMark && targetMark.markType === enums_1.GrammarMarkType.group ? targetMark : this.group).getGroupGraphicItem(), size = groupGraphicItem ? {
                        width: null !== (_a = groupGraphicItem.attribute.width) && void 0 !== _a ? _a : groupGraphicItem.AABBBounds.width(),
                        height: null !== (_b = groupGraphicItem.attribute.height) && void 0 !== _b ? _b : groupGraphicItem.AABBBounds.height()
                    } : {
                        width: this.view.width(),
                        height: this.view.height()
                    };
                    return (0, exports.generateScrollbarAttributes)(size, direction, position, theme, addition);
                }
            }), res;
        }), {});
        this._encoders = componentEncoders;
    }
}

exports.Scrollbar = Scrollbar, Scrollbar.componentType = enums_1.ComponentEnum.scrollbar;

const registerScrollbar = () => {
    factory_1.Factory.registerGraphicComponent(enums_1.ComponentEnum.scrollbar, (attrs => new vrender_components_1.ScrollBar(attrs))), 
    factory_1.Factory.registerComponent(enums_1.ComponentEnum.scrollbar, Scrollbar), 
    (0, vutils_1.mixin)(filter_1.Filter, filter_1.FilterMixin), factory_1.Factory.registerInteraction(scrollbar_filter_1.ScrollbarFilter.type, scrollbar_filter_1.ScrollbarFilter);
};

exports.registerScrollbar = registerScrollbar;
//# sourceMappingURL=scrollbar.js.map