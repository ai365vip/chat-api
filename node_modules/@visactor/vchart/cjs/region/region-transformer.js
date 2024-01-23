"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.RegionSpecTransformer = void 0;

const base_model_transformer_1 = require("../model/base-model-transformer");

class RegionSpecTransformer extends base_model_transformer_1.BaseModelSpecTransformer {
    _initTheme(spec, chartSpec) {
        return {
            spec: spec,
            theme: this._theme
        };
    }
}

exports.RegionSpecTransformer = RegionSpecTransformer;
//# sourceMappingURL=region-transformer.js.map
