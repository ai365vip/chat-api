import { SankeyLayout } from "./layout";

export const transform = (options, upstreamData) => {
    const res = new SankeyLayout(options).layout(Array.isArray(upstreamData) ? upstreamData[0] : upstreamData, "width" in options ? {
        width: options.width,
        height: options.height
    } : {
        x0: options.x0,
        x1: options.x1,
        y0: options.y0,
        y1: options.y1
    });
    return res ? [ res ] : [];
};
//# sourceMappingURL=transform.js.map