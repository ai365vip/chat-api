import { isContinuous } from "@visactor/vscale";

import { DiscreteLegend, ColorContinuousLegend, SizeContinuousLegend } from "@visactor/vrender-components";

import { array, isString, merge, last, mixin } from "@visactor/vutils";

import { ComponentEnum, LegendEnum } from "../graph/enums";

import { parseColor } from "../parse/util";

import { ScaleComponent } from "./scale";

import { invokeEncoder } from "../graph/mark/encode";

import { Factory } from "../core/factory";

import { LegendFilter } from "../interactions/legend-filter";

import { Filter, FilterMixin } from "../interactions/filter";

export const generateDiscreteLegendAttributes = (scale, theme, addition, shapeScale) => {
    var _a;
    const legendTheme = null === (_a = null == theme ? void 0 : theme.components) || void 0 === _a ? void 0 : _a.discreteLegend;
    if (!scale) return merge({}, legendTheme, null != addition ? addition : {});
    const items = Array.from(new Set(array(scale.domain()))).map(((item, index) => {
        var _a, _b, _c, _d, _e, _f;
        const value = scale.scale(item), color = parseColor(value), shape = color ? Object.assign(Object.assign({}, null !== (_c = null === (_b = null === (_a = null == legendTheme ? void 0 : legendTheme.items) || void 0 === _a ? void 0 : _a[0]) || void 0 === _b ? void 0 : _b.shape) && void 0 !== _c ? _c : {}), {
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
    return merge({}, legendTheme, {
        items: items
    }, null != addition ? addition : {});
};

export const generateColorLegendAttributes = (scale, theme, addition) => {
    var _a;
    const legendTheme = null === (_a = null == theme ? void 0 : theme.components) || void 0 === _a ? void 0 : _a.colorLegend;
    if (!scale) return merge({}, legendTheme, null != addition ? addition : {});
    const domain = scale.domain();
    return merge({}, legendTheme, {
        colors: scale.range().slice(),
        min: domain[0],
        max: last(domain)
    }, null != addition ? addition : {});
};

export const generateSizeLegendAttributes = (scale, theme, addition) => {
    var _a;
    const legendTheme = null === (_a = null == theme ? void 0 : theme.components) || void 0 === _a ? void 0 : _a.sizeLegend;
    if (!scale) return merge({}, legendTheme, null != addition ? addition : {});
    const domain = scale.domain(), attributes = {
        min: domain[0],
        max: domain[domain.length - 1],
        value: [ domain[0], domain[domain.length - 1] ]
    };
    return merge({}, legendTheme, attributes, null != addition ? addition : {});
};

export class Legend extends ScaleComponent {
    constructor(view, group) {
        super(view, ComponentEnum.legend, group), this.spec.componentType = ComponentEnum.legend, 
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
            const lastScaleGrammar = isString(this.spec.shapeScale) ? this.view.getScaleById(this.spec.shapeScale) : this.spec.shapeScale;
            this.detach(lastScaleGrammar), this.spec.shapeScale = void 0;
        }
        const scaleGrammar = isString(shapeScale) ? this.view.getScaleById(shapeScale) : shapeScale;
        return this.spec.shapeScale = scaleGrammar, this.attach(scaleGrammar), this.commit(), 
        this;
    }
    legendType(legendType) {
        return this.spec.legendType = legendType, this._legendComponentType = null, this._prepareRejoin(), 
        this.commit(), this;
    }
    isContinuousLegend() {
        return this._getLegendComponentType() !== LegendEnum.discreteLegend;
    }
    setSelected(selectedValues) {
        return this.getGroupGraphicItem().setSelected(selectedValues), this;
    }
    addGraphicItem(attrs, groupKey) {
        const graphicItem = Factory.createGraphicComponent(this._getLegendComponentType(), attrs, {
            skipDefault: this.spec.skipTheme
        });
        return super.addGraphicItem(attrs, groupKey, graphicItem);
    }
    _updateComponentEncoders() {
        const scaleGrammar = isString(this.spec.scale) ? this.view.getScaleById(this.spec.scale) : this.spec.scale, shapeScaleGrammar = isString(this.spec.shapeScale) ? this.view.getScaleById(this.spec.shapeScale) : this.spec.shapeScale, encoders = Object.assign({
            update: {}
        }, this.spec.encode), componentEncoders = Object.keys(encoders).reduce(((res, state) => {
            const encoder = encoders[state];
            return encoder && (res[state] = {
                callback: (datum, element, parameters) => {
                    var _a, _b;
                    const theme = this.spec.skipTheme ? null : this.view.getCurrentTheme(), addition = invokeEncoder(encoder, datum, element, parameters), scale = null === (_a = null == scaleGrammar ? void 0 : scaleGrammar.getScale) || void 0 === _a ? void 0 : _a.call(scaleGrammar);
                    switch (this._getLegendComponentType()) {
                      case LegendEnum.discreteLegend:
                        return generateDiscreteLegendAttributes(scale, theme, addition, null === (_b = null == shapeScaleGrammar ? void 0 : shapeScaleGrammar.getScale) || void 0 === _b ? void 0 : _b.call(shapeScaleGrammar));

                      case LegendEnum.colorLegend:
                        return generateColorLegendAttributes(scale, theme, addition);

                      case LegendEnum.sizeLegend:
                        return generateSizeLegendAttributes(scale, theme, addition);
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
            const scaleGrammar = isString(this.spec.scale) ? this.view.getScaleById(this.spec.scale) : this.spec.scale, scaleType = null === (_a = null == scaleGrammar ? void 0 : scaleGrammar.getScaleType) || void 0 === _a ? void 0 : _a.call(scaleGrammar);
            if (scaleType && isContinuous(scaleType)) {
                const range = scaleGrammar.getScale().range();
                parseColor(null == range ? void 0 : range[0]) ? this._legendComponentType = LegendEnum.colorLegend : this._legendComponentType = LegendEnum.sizeLegend;
            } else this._legendComponentType = LegendEnum.discreteLegend;
        }
        return this._legendComponentType;
    }
}

Legend.componentType = ComponentEnum.legend;

export const registerLegend = () => {
    Factory.registerGraphicComponent(LegendEnum.discreteLegend, (attrs => new DiscreteLegend(attrs))), 
    Factory.registerGraphicComponent(LegendEnum.colorLegend, (attrs => new ColorContinuousLegend(attrs))), 
    Factory.registerGraphicComponent(LegendEnum.sizeLegend, (attrs => new SizeContinuousLegend(attrs))), 
    Factory.registerComponent(ComponentEnum.legend, Legend), mixin(Filter, FilterMixin), 
    Factory.registerInteraction(LegendFilter.type, LegendFilter);
};
//# sourceMappingURL=legend.js.map