import { range } from "@visactor/vutils";

export const transform = options => {
    const {start: start, stop: stop, step: step = 1, as: as = "data"} = options;
    return range(start, stop, step).map((val => ({
        [as]: val
    })));
};
//# sourceMappingURL=range.js.map
