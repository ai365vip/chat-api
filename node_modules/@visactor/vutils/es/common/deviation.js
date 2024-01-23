import { variance } from "./variance";

export function deviation(values, valueof) {
    const v = variance(values, valueof);
    return v ? Math.sqrt(v) : v;
}
//# sourceMappingURL=deviation.js.map