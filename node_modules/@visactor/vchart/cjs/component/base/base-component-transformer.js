"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.BaseComponentSpecTransformer = void 0;

const model_1 = require("../../model"), util_1 = require("../../util"), util_2 = require("./util");

class BaseComponentSpecTransformer extends model_1.BaseModelSpecTransformer {
    getTheme(spec, chartSpec) {
        return (0, util_2.getComponentThemeFromGlobalTheme)(this.type, this._option.getTheme(), spec, chartSpec);
    }
    _mergeThemeToSpec(spec, chartSpec) {
        const {spec: newSpec, theme: theme} = super._mergeThemeToSpec(spec, chartSpec);
        return this._adjustPadding(newSpec), {
            spec: newSpec,
            theme: theme
        };
    }
    _adjustPadding(spec) {
        const {padding: padding, noOuterPadding: noOuterPadding = !0, orient: orient} = spec;
        noOuterPadding && padding && orient && (spec.padding = Object.assign(Object.assign({}, (0, 
        util_1.normalizeLayoutPaddingSpec)(padding)), {
            [orient]: 0
        }));
    }
}

exports.BaseComponentSpecTransformer = BaseComponentSpecTransformer;
//# sourceMappingURL=base-component-transformer.js.map
