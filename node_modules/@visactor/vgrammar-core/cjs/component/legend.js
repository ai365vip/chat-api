"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.registerLegend = exports.Legend = exports.generateSizeLegendAttributes = exports.generateColorLegendAttributes = exports.generateDiscreteLegendAttributes = void 0;

const vscale_1 = require("@visactor/vscale"), vrender_components_1 = require("@visactor/vrender-components"), vutils_1 = require("@visactor/vutils"), enums_1 = require("../graph/enums"), util_1 = require("../parse/util"), scale_1 = require("./scale"), encode_1 = require("../graph/mark/encode"), factory_1 = require("../core/factory"), legend_filter_1 = require("../interactions/legend-filter"), filter_1 = require("../interactions/filter"), generateDiscreteLegendAttributes = (scale, theme, addition, shapeScale) => {
    var _a;
    const legendTheme = null === (_a = null == theme ? void 0 : theme.components) || void 0 === _a ? void 0 : _a.discreteLegend;
    if (!scale) return (0, vutils_1.merge)({}, legendTheme, null != addition ? addition : {});
    const items = Array.from(new Set((0, vutils_1.array)(scale.domain()))).map(((item, index) => {
        var _a, _b, _c, _d, _e, _f;
        const value = scale.scale(item), color = (0, util_1.parseColor)(value), shape = color ? Object.assign(Object.assign({}, null !== (_c = null === (_b = null === (_a = null == legendTheme ? void 0 : legendTheme.items) || void 0 === _a ? void 0 : _a[0]) || void 0 === _b ? void 0 : _b.shape) && void 0 !== _c ? _c : {}), {
            fill: color,
            stroke: color
        }) : null !== (_f = null === (_e = null === (_d = null == legendTheme ? void 0 : legendTheme.items) || void 0 === _d ? void 0 : _d[0]) || void 0 === _e ? void 0 : _e.shape) && void 0 !== _f ? _f : {};
        return shapeScale && Object.assign(shape, {
            symbolType: shapeScale.scale(item)
        }), {
            label: item.toString(),
            id: item,
            shape: shape,
            index: index
        };
    }));
    return (0, vutils_1.merge)({}, legendTheme, {
        items: items
    }, null != addition ? addition : {});
};

exports.generateDiscreteLegendAttributes = generateDiscreteLegendAttributes;

const generateColorLegendAttributes = (scale, theme, addition) => {
    var _a;
    const legendTheme = null === (_a = null == theme ? void 0 : theme.components) || void 0 === _a ? void 0 : _a.colorLegend;
    if (!scale) return (0, vutils_1.merge)({}, legendTheme, null != addition ? addition : {});
    const domain = scale.domain();
    return (0, vutils_1.merge)({}, legendTheme, {
        colors: scale.range().slice(),
        min: domain[0],
        max: (0, vutils_1.last)(domain)
    }, null != addition ? addition : {});
};

exports.generateColorLegendAttributes = generateColorLegendAttributes;

const generateSizeLegendAttributes = (scale, theme, addition) => {
    var _a;
    const legendTheme = null === (_a = null == theme ? void 0 : theme.components) || void 0 === _a ? void 0 : _a.sizeLegend;
    if (!scale) return (0, vutils_1.merge)({}, legendTheme, null != addition ? addition : {});
    const domain = scale.domain(), attributes = {
        min: domain[0],
        max: domain[domain.length - 1],
        value: [ domain[0], domain[domain.length - 1] ]
    };
    return (0, vutils_1.merge)({}, legendTheme, attributes, null != addition ? addition : {});
};

exports.generateSizeLegendAttributes = generateSizeLegendAttributes;

class Legend extends scale_1.ScaleComponent {
    constructor(view, group) {
        super(view, enums_1.ComponentEnum.legend, group), this.spec.componentType = enums_1.ComponentEnum.legend, 
        this.spec.legendType = "auto";
    }
    parseAddition(spec) {
        return this.shapeScale(spec.shapeScale), super.parseAddition(spec), this.legendType(spec.legendType), 
        this;
    }
    scale(scale) {
        return super.scale(scale), this._legendComponentType = null, this;
    }
    shapeScale(shapeScale) {
        if (this.spec.shapeScale) {
            const lastScaleGrammar = (0, vutils_1.isString)(this.spec.shapeScale) ? this.view.getScaleById(this.spec.shapeScale) : this.spec.shapeScale;
            this.detach(lastScaleGrammar), this.spec.shapeScale = void 0;
        }
        const scaleGrammar = (0, vutils_1.isString)(shapeScale) ? this.view.getScaleById(shapeScale) : shapeScale;
        return this.spec.shapeScale = scaleGrammar, this.attach(scaleGrammar), this.commit(), 
        this;
    }
    legendType(legendType) {
        return this.spec.legendType = legendType, this._legendComponentType = null, this._prepareRejoin(), 
        this.commit(), this;
    }
    isContinuousLegend() {
        return this._getLegendComponentType() !== enums_1.LegendEnum.discreteLegend;
    }
    setSelected(selectedValues) {
        return this.getGroupGraphicItem().setSelected(selectedValues), this;
    }
    addGraphicItem(attrs, groupKey) {
        const graphicItem = factory_1.Factory.createGraphicComponent(this._getLegendComponentType(), attrs, {
            skipDefault: this.spec.skipTheme
        });
        return super.addGraphicItem(attrs, groupKey, graphicItem);
    }
    _updateComponentEncoders() {
        const scaleGrammar = (0, vutils_1.isString)(this.spec.scale) ? this.view.getScaleById(this.spec.scale) : this.spec.scale, shapeScaleGrammar = (0, 
        vutils_1.isString)(this.spec.shapeScale) ? this.view.getScaleById(this.spec.shapeScale) : this.spec.shapeScale, encoders = Object.assign({
            update: {}
        }, this.spec.encode), componentEncoders = Object.keys(encoders).reduce(((res, state) => {
            const encoder = encoders[state];
            return encoder && (res[state] = {
                callback: (datum, element, parameters) => {
                    var _a, _b;
                    const theme = this.spec.skipTheme ? null : this.view.getCurrentTheme(), addition = (0, 
                    encode_1.invokeEncoder)(encoder, datum, element, parameters), scale = null === (_a = null == scaleGrammar ? void 0 : scaleGrammar.getScale) || void 0 === _a ? void 0 : _a.call(scaleGrammar);
                    switch (this._getLegendComponentType()) {
                      case enums_1.LegendEnum.discreteLegend:
                        return (0, exports.generateDiscreteLegendAttributes)(scale, theme, addition, null === (_b = null == shapeScaleGrammar ? void 0 : shapeScaleGrammar.getScale) || void 0 === _b ? void 0 : _b.call(shapeScaleGrammar));

                      case enums_1.LegendEnum.colorLegend:
                        return (0, exports.generateColorLegendAttributes)(scale, theme, addition);

                      case enums_1.LegendEnum.sizeLegend:
                        return (0, exports.generateSizeLegendAttributes)(scale, theme, addition);
                    }
                    return addition;
                }
            }), res;
        }), {});
        this._encoders = componentEncoders;
    }
    _getLegendComponentType() {
        var _a;
        if (this._legendComponentType) return this._legendComponentType;
        if (this.spec.legendType && "auto" !== this.spec.legendType) this._legendComponentType = "color" === this.spec.legendType ? "colorLegend" : "size" === this.spec.legendType ? "sizeLegend" : "discreteLegend"; else {
            const scaleGrammar = (0, vutils_1.isString)(this.spec.scale) ? this.view.getScaleById(this.spec.scale) : this.spec.scale, scaleType = null === (_a = null == scaleGrammar ? void 0 : scaleGrammar.getScaleType) || void 0 === _a ? void 0 : _a.call(scaleGrammar);
            if (scaleType && (0, vscale_1.isContinuous)(scaleType)) {
                const range = scaleGrammar.getScale().range();
                (0, util_1.parseColor)(null == range ? void 0 : range[0]) ? this._legendComponentType = enums_1.LegendEnum.colorLegend : this._legendComponentType = enums_1.LegendEnum.sizeLegend;
            } else this._legendComponentType = enums_1.LegendEnum.discreteLegend;
        }
        return this._legendComponentType;
    }
}

exports.Legend = Legend, Legend.componentType = enums_1.ComponentEnum.legend;

const registerLegend = () => {
    factory_1.Factory.registerGraphicComponent(enums_1.LegendEnum.discreteLegend, (attrs => new vrender_components_1.DiscreteLegend(attrs))), 
    factory_1.Factory.registerGraphicComponent(enums_1.LegendEnum.colorLegend, (attrs => new vrender_components_1.ColorContinuousLegend(attrs))), 
    factory_1.Factory.registerGraphicComponent(enums_1.LegendEnum.sizeLegend, (attrs => new vrender_components_1.SizeContinuousLegend(attrs))), 
    factory_1.Factory.registerComponent(enums_1.ComponentEnum.legend, Legend), (0, vutils_1.mixin)(filter_1.Filter, filter_1.FilterMixin), 
    factory_1.Factory.registerInteraction(legend_filter_1.LegendFilter.type, legend_filter_1.LegendFilter);
};

exports.registerLegend = registerLegend;
//# sourceMappingURL=legend.js.map