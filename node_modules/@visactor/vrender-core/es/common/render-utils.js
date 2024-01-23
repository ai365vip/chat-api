import { divideCubic } from "./segment/curve/cubic-bezier";

export function drawSegItem(ctx, curve, endPercent, params) {
    if (!curve.p1) return;
    const {offsetX: offsetX = 0, offsetY: offsetY = 0, offsetZ: offsetZ = 0} = params || {};
    if (1 === endPercent) curve.p2 && curve.p3 ? ctx.bezierCurveTo(offsetX + curve.p1.x, offsetY + curve.p1.y, offsetX + curve.p2.x, offsetY + curve.p2.y, offsetX + curve.p3.x, offsetY + curve.p3.y, offsetZ) : ctx.lineTo(offsetX + curve.p1.x, offsetY + curve.p1.y, offsetZ); else if (curve.p2 && curve.p3) {
        const [curve1] = divideCubic(curve, endPercent);
        ctx.bezierCurveTo(offsetX + curve1.p1.x, offsetY + curve1.p1.y, offsetX + curve1.p2.x, offsetY + curve1.p2.y, offsetX + curve1.p3.x, offsetY + curve1.p3.y, offsetZ);
    } else {
        const p = curve.getPointAt(endPercent);
        ctx.lineTo(offsetX + p.x, offsetY + p.y, offsetZ);
    }
}
//# sourceMappingURL=render-utils.js.map