"use strict";

function drawPolygon(path, points, x, y) {
    path.moveTo(points[0].x + x, points[0].y + y);
    for (let i = 1; i < points.length; i++) path.lineTo(points[i].x + x, points[i].y + y);
}

function drawRoundedPolygon(path, points, x, y, cornerRadius, closePath = !0) {
    var _a;
    if (points.length < 3) return void drawPolygon(path, points, x, y);
    let startI = 0, endI = points.length - 1;
    closePath || (startI += 1, endI -= 1, path.moveTo(points[0].x + x, points[0].y + y));
    for (let i = startI; i <= endI; i++) {
        const p1 = points[0 === i ? endI : (i - 1) % points.length], angularPoint = points[i % points.length], p2 = points[(i + 1) % points.length], dx1 = angularPoint.x - p1.x, dy1 = angularPoint.y - p1.y, dx2 = angularPoint.x - p2.x, dy2 = angularPoint.y - p2.y, angle = (Math.atan2(dy1, dx1) - Math.atan2(dy2, dx2)) / 2, tan = Math.abs(Math.tan(angle));
        let radius = Array.isArray(cornerRadius) ? null !== (_a = cornerRadius[i % points.length]) && void 0 !== _a ? _a : 0 : cornerRadius, segment = radius / tan;
        const length1 = getLength(dx1, dy1), length2 = getLength(dx2, dy2), length = Math.min(length1, length2);
        segment > length && (segment = length, radius = length * tan);
        const p1Cross = getProportionPoint(angularPoint, segment, length1, dx1, dy1), p2Cross = getProportionPoint(angularPoint, segment, length2, dx2, dy2), dx = 2 * angularPoint.x - p1Cross.x - p2Cross.x, dy = 2 * angularPoint.y - p1Cross.y - p2Cross.y, L = getLength(dx, dy), circlePoint = getProportionPoint(angularPoint, getLength(segment, radius), L, dx, dy);
        let startAngle = Math.atan2(p1Cross.y - circlePoint.y, p1Cross.x - circlePoint.x);
        const endAngle = Math.atan2(p2Cross.y - circlePoint.y, p2Cross.x - circlePoint.x);
        let sweepAngle = endAngle - startAngle;
        sweepAngle < 0 && (startAngle = endAngle, sweepAngle = -sweepAngle), sweepAngle > Math.PI && (sweepAngle -= Math.PI), 
        0 === i ? path.moveTo(p1Cross.x + x, p1Cross.y + y) : path.lineTo(p1Cross.x + x, p1Cross.y + y), 
        sweepAngle && path.arcTo(angularPoint.x + x, angularPoint.y + y, p2Cross.x + x, p2Cross.y + y, radius), 
        path.lineTo(p2Cross.x + x, p2Cross.y + y);
    }
    closePath || path.lineTo(points[endI + 1].x + x, points[endI + 1].y + y);
}

function getLength(dx, dy) {
    return Math.sqrt(dx * dx + dy * dy);
}

function getProportionPoint(point, segment, length, dx, dy) {
    const factor = segment / length;
    return {
        x: point.x - dx * factor,
        y: point.y - dy * factor
    };
}

//# sourceMappingURL=polygon.js.map
Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.drawRoundedPolygon = exports.drawPolygon = void 0, exports.drawPolygon = drawPolygon, 
exports.drawRoundedPolygon = drawRoundedPolygon;