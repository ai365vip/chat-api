import { isNil, merge, mixin } from "@visactor/vutils";

import { Slider as SliderComponent } from "@visactor/vrender-components";

import { ComponentEnum } from "../graph/enums";

import { Component } from "../view/component";

import { invokeEncoder } from "../graph/mark/encode";

import { invokeFunctionType } from "../parse/util";

import { Factory } from "../core/factory";

import { SliderFilter } from "../interactions/slider-filter";

import { Filter, FilterMixin } from "../interactions/filter";

export const generateSliderAttributes = (min, max, theme, addition) => {
    var _a;
    const sliderTheme = null === (_a = null == theme ? void 0 : theme.components) || void 0 === _a ? void 0 : _a.slider;
    return merge({}, sliderTheme, {
        min: min,
        max: max,
        value: [ min, max ]
    }, null != addition ? addition : {});
};

export class Slider extends Component {
    constructor(view, group) {
        super(view, ComponentEnum.slider, group), this.spec.componentType = ComponentEnum.slider;
    }
    parseAddition(spec) {
        return super.parseAddition(spec), this.min(spec.min), this.max(spec.max), this;
    }
    min(min) {
        return this.setFunctionSpec(min, "min");
    }
    max(max) {
        return this.setFunctionSpec(max, "max");
    }
    setStartEndValue(start, end) {
        return this.getGroupGraphicItem().setValue([ start, end ]), this;
    }
    _updateComponentEncoders() {
        const encoders = Object.assign({
            update: {}
        }, this.spec.encode), componentEncoders = Object.keys(encoders).reduce(((res, state) => {
            const encoder = encoders[state];
            return encoder && (res[state] = {
                callback: (datum, element, parameters) => {
                    const min = isNil(this.spec.min) ? 0 : invokeFunctionType(this.spec.min, parameters, datum, element), max = isNil(this.spec.max) ? 1 : invokeFunctionType(this.spec.max, parameters, datum, element), theme = this.spec.skipTheme ? null : this.view.getCurrentTheme(), addition = invokeEncoder(encoder, datum, element, parameters);
                    return generateSliderAttributes(min, max, theme, addition);
                }
            }), res;
        }), {});
        this._encoders = componentEncoders;
    }
}

Slider.componentType = ComponentEnum.slider;

export const registerSlider = () => {
    Factory.registerGraphicComponent(ComponentEnum.slider, (attrs => new SliderComponent(attrs))), 
    Factory.registerComponent(ComponentEnum.slider, Slider), mixin(Filter, FilterMixin), 
    Factory.registerInteraction(SliderFilter.type, SliderFilter);
};
//# sourceMappingURL=slider.js.map