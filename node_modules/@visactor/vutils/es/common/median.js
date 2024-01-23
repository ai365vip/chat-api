import { ascending } from "./ascending";

import { quantileSorted } from "./quantileSorted";

export const median = (values, isSorted) => {
    let sorted = values;
    return !0 !== isSorted && (sorted = values.sort(ascending)), quantileSorted(sorted, .5);
};
//# sourceMappingURL=median.js.map
