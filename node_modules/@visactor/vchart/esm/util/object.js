import { get, pick, cloneDeep, isArray } from "@visactor/vutils";

export { get, pick, cloneDeep };

export function field(f) {
    return function(datum) {
        let value;
        return value = isArray(f) ? f.reduce(((cur, g) => null == cur ? void 0 : cur[g]), datum) : null == datum ? void 0 : datum[f], 
        value;
    };
}
//# sourceMappingURL=object.js.map
