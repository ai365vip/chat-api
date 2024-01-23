import { isValid, merge } from "@visactor/vutils";

import { Title as TitleComponent } from "@visactor/vrender-components";

import { ComponentEnum } from "../graph/enums";

import { Component } from "../view/component";

import { invokeEncoder } from "../graph/mark/encode";

import { invokeFunctionType } from "../parse/util";

import { Factory } from "../core/factory";

export const generateTitleAttributes = (title, subTitle, theme, addition) => {
    var _a;
    const titleTheme = null === (_a = null == theme ? void 0 : theme.components) || void 0 === _a ? void 0 : _a.title, attributes = {};
    return isValid(title) && (attributes.text = title), isValid(subTitle) && (attributes.subtext = subTitle), 
    merge({}, titleTheme, attributes, null != addition ? addition : {});
};

export class Title extends Component {
    constructor(view, group) {
        super(view, ComponentEnum.title, group), this.spec.componentType = ComponentEnum.title;
    }
    parseAddition(spec) {
        return super.parseAddition(spec), this.title(spec.title), this.subTitle(spec.subTitle), 
        this;
    }
    title(text) {
        return this.setFunctionSpec(text, "title");
    }
    subTitle(text) {
        return this.setFunctionSpec(text, "subTitle");
    }
    _updateComponentEncoders() {
        const encoders = Object.assign({
            update: {}
        }, this.spec.encode), componentEncoders = Object.keys(encoders).reduce(((res, state) => {
            const encoder = encoders[state];
            return encoder && (res[state] = {
                callback: (datum, element, parameters) => {
                    const theme = this.spec.skipTheme ? null : this.view.getCurrentTheme(), title = invokeFunctionType(this.spec.title, parameters, datum, element), subTitle = invokeFunctionType(this.spec.subTitle, parameters, datum, element), addition = invokeEncoder(encoder, datum, element, parameters);
                    return generateTitleAttributes(title, subTitle, theme, addition);
                }
            }), res;
        }), {});
        this._encoders = componentEncoders;
    }
}

Title.componentType = ComponentEnum.title;

export const registerTitle = () => {
    Factory.registerGraphicComponent(ComponentEnum.title, (attrs => new TitleComponent(attrs))), 
    Factory.registerComponent(ComponentEnum.title, Title);
};
//# sourceMappingURL=title.js.map