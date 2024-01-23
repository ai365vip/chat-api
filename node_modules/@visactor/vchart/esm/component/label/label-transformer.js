import { BaseComponentSpecTransformer } from "../base";

export class LabelSpecTransformer extends BaseComponentSpecTransformer {
    _initTheme(spec, chartSpec) {
        return {
            spec: spec,
            theme: this._theme
        };
    }
}
//# sourceMappingURL=label-transformer.js.map
