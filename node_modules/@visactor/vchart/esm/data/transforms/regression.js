import { regression } from "../../util/math";

export function markerRegression(_data, opt) {
    const data = _data[0].latestData;
    return regression(data, opt.fieldX, opt.fieldY);
}
//# sourceMappingURL=regression.js.map
