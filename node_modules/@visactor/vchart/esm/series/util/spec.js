import { SeriesTypeEnum } from "../interface";

export function getDirectionFromSeriesSpec(spec) {
    var _a, _b;
    const {type: type} = spec;
    return type === SeriesTypeEnum.sankey ? null !== (_a = spec.direction) && void 0 !== _a ? _a : "horizontal" : null !== (_b = spec.direction) && void 0 !== _b ? _b : "vertical";
}
//# sourceMappingURL=spec.js.map
