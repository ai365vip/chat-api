import { isFunction, isNumber, isNil } from "@visactor/vutils";

export const extent = (array, func) => {
    const valueGetter = isFunction(func) ? func : val => val;
    let min, max;
    if (array && array.length) {
        const n = array.length;
        for (let i = 0; i < n; i += 1) {
            let value = valueGetter(array[i]);
            isNil(value) || !isNumber(value = +value) || Number.isNaN(value) || (isNil(min) ? (min = value, 
            max = value) : (min = Math.min(min, value), max = Math.max(max, value)));
        }
        return [ min, max ];
    }
    return [ min, max ];
};
//# sourceMappingURL=extent.js.map