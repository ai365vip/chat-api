import { CirclePackingLayout } from "@visactor/vgrammar-hierarchy";

export const circlePackingLayout = (data, op) => {
    if (!data) return data;
    const options = op(), {width: width, height: height} = options;
    if (0 === width || 0 === height) return data;
    return new CirclePackingLayout(options).layout(data, {
        width: width,
        height: height
    });
};
//# sourceMappingURL=circle-packing.js.map
