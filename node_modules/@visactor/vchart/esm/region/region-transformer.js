import { BaseModelSpecTransformer } from "../model/base-model-transformer";

export class RegionSpecTransformer extends BaseModelSpecTransformer {
    _initTheme(spec, chartSpec) {
        return {
            spec: spec,
            theme: this._theme
        };
    }
}
//# sourceMappingURL=region-transformer.js.map
