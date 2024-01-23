import { BaseModelSpecTransformer } from "../../model";

import { normalizeLayoutPaddingSpec } from "../../util";

import { getComponentThemeFromGlobalTheme } from "./util";

export class BaseComponentSpecTransformer extends BaseModelSpecTransformer {
    getTheme(spec, chartSpec) {
        return getComponentThemeFromGlobalTheme(this.type, this._option.getTheme(), spec, chartSpec);
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
        noOuterPadding && padding && orient && (spec.padding = Object.assign(Object.assign({}, normalizeLayoutPaddingSpec(padding)), {
            [orient]: 0
        }));
    }
}
//# sourceMappingURL=base-component-transformer.js.map
