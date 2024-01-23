import { isNil } from "@visactor/vutils";

export const normalizeRectAttributes = attribute => {
    if (!attribute) return {
        x: 0,
        y: 0,
        width: 0,
        height: 0
    };
    let width = isNil(attribute.width) ? attribute.x1 - attribute.x : attribute.width, height = isNil(attribute.height) ? attribute.y1 - attribute.y : attribute.height, x = 0, y = 0;
    return width < 0 ? (x = width, width = -width) : Number.isNaN(width) && (width = 0), 
    height < 0 ? (y = height, height = -height) : Number.isNaN(height) && (height = 0), 
    {
        x: x,
        y: y,
        width: width,
        height: height
    };
};
//# sourceMappingURL=rect-utils.js.map