"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.registerTitle = exports.Title = exports.generateTitleAttributes = void 0;

const vutils_1 = require("@visactor/vutils"), vrender_components_1 = require("@visactor/vrender-components"), enums_1 = require("../graph/enums"), component_1 = require("../view/component"), encode_1 = require("../graph/mark/encode"), util_1 = require("../parse/util"), factory_1 = require("../core/factory"), generateTitleAttributes = (title, subTitle, theme, addition) => {
    var _a;
    const titleTheme = null === (_a = null == theme ? void 0 : theme.components) || void 0 === _a ? void 0 : _a.title, attributes = {};
    return (0, vutils_1.isValid)(title) && (attributes.text = title), (0, vutils_1.isValid)(subTitle) && (attributes.subtext = subTitle), 
    (0, vutils_1.merge)({}, titleTheme, attributes, null != addition ? addition : {});
};

exports.generateTitleAttributes = generateTitleAttributes;

class Title extends component_1.Component {
    constructor(view, group) {
        super(view, enums_1.ComponentEnum.title, group), this.spec.componentType = enums_1.ComponentEnum.title;
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
                    const theme = this.spec.skipTheme ? null : this.view.getCurrentTheme(), title = (0, 
                    util_1.invokeFunctionType)(this.spec.title, parameters, datum, element), subTitle = (0, 
                    util_1.invokeFunctionType)(this.spec.subTitle, parameters, datum, element), addition = (0, 
                    encode_1.invokeEncoder)(encoder, datum, element, parameters);
                    return (0, exports.generateTitleAttributes)(title, subTitle, theme, addition);
                }
            }), res;
        }), {});
        this._encoders = componentEncoders;
    }
}

exports.Title = Title, Title.componentType = enums_1.ComponentEnum.title;

const registerTitle = () => {
    factory_1.Factory.registerGraphicComponent(enums_1.ComponentEnum.title, (attrs => new vrender_components_1.Title(attrs))), 
    factory_1.Factory.registerComponent(enums_1.ComponentEnum.title, Title);
};

exports.registerTitle = registerTitle;
//# sourceMappingURL=title.js.map