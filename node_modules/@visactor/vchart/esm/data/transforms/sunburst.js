import { SunburstLayout } from "@visactor/vgrammar-hierarchy";

export const sunburstLayout = (data, op) => {
    if (!data) return data;
    const options = op(), {width: width, height: height} = options;
    return new SunburstLayout(options).layout(data, {
        width: width,
        height: height
    });
};
//# sourceMappingURL=sunburst.js.map
