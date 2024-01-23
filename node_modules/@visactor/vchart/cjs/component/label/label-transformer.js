"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.LabelSpecTransformer = void 0;

const base_1 = require("../base");

class LabelSpecTransformer extends base_1.BaseComponentSpecTransformer {
    _initTheme(spec, chartSpec) {
        return {
            spec: spec,
            theme: this._theme
        };
    }
}

exports.LabelSpecTransformer = LabelSpecTransformer;
//# sourceMappingURL=label-transformer.js.map
