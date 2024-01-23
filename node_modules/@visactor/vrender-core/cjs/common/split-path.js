"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.splitPath = exports.splitPolygon = exports.recursiveCallBinarySplit = exports.binarySplitPolygon = exports.splitLine = exports.splitArea = exports.splitCircle = exports.splitArc = exports.splitRect = exports.splitToGrids = void 0;

const vutils_1 = require("@visactor/vutils"), morphing_utils_1 = require("./morphing-utils"), rect_utils_1 = require("./rect-utils");

function splitToGrids(width, height, count) {
    const ratio = width / height;
    let rowCount, columnCount;
    width >= height ? (columnCount = Math.ceil(Math.sqrt(count * ratio)), rowCount = Math.floor(count / columnCount), 
    0 === rowCount && (rowCount = 1, columnCount = count)) : (rowCount = Math.ceil(Math.sqrt(count / ratio)), 
    columnCount = Math.floor(count / rowCount), 0 === columnCount && (columnCount = 1, 
    rowCount = count));
    const grids = [];
    for (let i = 0; i < rowCount; i++) grids.push(columnCount);
    const remained = count - rowCount * columnCount;
    if (remained > 0) for (let i = 0; i < remained; i += columnCount) i + columnCount < remained ? grids.push(columnCount) : grids.push(remained - i);
    return grids;
}

exports.splitToGrids = splitToGrids;

const splitRect = (rect, count) => {
    const {width: width, height: height} = (0, rect_utils_1.normalizeRectAttributes)(rect.attribute), grids = splitToGrids(width, height, count), res = [], gridHeight = height / grids.length;
    for (let i = 0, rowCount = grids.length; i < rowCount; i++) {
        const columnCount = grids[i], gridWidth = width / columnCount;
        for (let j = 0; j < columnCount; j++) res.push({
            x: 0 + j * gridWidth,
            y: 0 + i * gridHeight,
            width: gridWidth,
            height: gridHeight
        });
    }
    return res;
};

exports.splitRect = splitRect;

const splitArc = (arc, count) => {
    const angles = arc.getParsedAngle(), startAngle = angles.startAngle, endAngle = angles.endAngle, innerRadius = arc.getComputedAttribute("innerRadius"), outerRadius = arc.getComputedAttribute("outerRadius"), angleDelta = Math.abs(startAngle - endAngle), radiusDelta = Math.abs(outerRadius - innerRadius), grids = splitToGrids(angleDelta * (innerRadius + outerRadius) / 2, radiusDelta, count), res = [], gridRadius = radiusDelta / grids.length, radiusSign = outerRadius >= innerRadius ? 1 : -1, angleSign = endAngle >= startAngle ? 1 : -1;
    for (let i = 0, rowCount = grids.length; i < rowCount; i++) {
        const columnCount = grids[i], gridAngle = angleDelta / columnCount;
        for (let j = 0; j < columnCount; j++) res.push({
            innerRadius: outerRadius - gridRadius * i * radiusSign,
            outerRadius: outerRadius - gridRadius * (i + 1) * radiusSign,
            startAngle: startAngle + gridAngle * j * angleSign,
            endAngle: startAngle + gridAngle * (j + 1) * angleSign
        });
    }
    return res;
};

exports.splitArc = splitArc;

const splitCircle = (arc, count) => {
    const startAngle = arc.getComputedAttribute("startAngle"), endAngle = arc.getComputedAttribute("endAngle"), radius = arc.getComputedAttribute("radius"), angleDelta = Math.abs(startAngle - endAngle), grids = splitToGrids(angleDelta * radius, radius, count), res = [], gridAngle = angleDelta / grids[0], gridRadius = radius / grids.length, angleSign = endAngle >= startAngle ? 1 : -1;
    for (let i = 0, rowCount = grids.length; i < rowCount; i++) for (let j = 0, columnCount = grids[i]; j < columnCount; j++) res.push({
        innerRadius: gridRadius * i,
        outerRadius: gridRadius * (i + 1),
        startAngle: startAngle + gridAngle * j * angleSign,
        endAngle: startAngle + gridAngle * (j + 1) * angleSign
    });
    return res;
};

exports.splitCircle = splitCircle;

const samplingPoints = (points, count) => {
    const validatePoints = points.filter((point => !1 !== point.defined && (0, vutils_1.isNumber)(point.x) && (0, 
    vutils_1.isNumber)(point.y)));
    if (0 === validatePoints.length) return [];
    if (1 === validatePoints.length) return new Array(count).fill(0).map((i => validatePoints[0]));
    const res = [];
    if (count <= validatePoints.length) {
        const step = validatePoints.length / count;
        let i = 0, cur = 0;
        for (;i < count; ) res.push(validatePoints[Math.floor(cur)]), cur += step, i++;
        return res;
    }
    const insertCount = count - validatePoints.length, insetRatio = 1 / (insertCount / (validatePoints.length - 1) + 1);
    let curCount = 0;
    for (let i = 0, len = points.length; i < len; i++) if (res.push(points[i]), i < len - 1) {
        let cur = insetRatio;
        const xCur = points[i].x, yCur = points[i].y, xNext = points[i + 1].x, yNext = points[i + 1].y;
        for (;cur < 1 && curCount < insertCount; ) res.push({
            x: xCur + (xNext - xCur) * cur,
            y: yCur + (yNext - yCur) * cur
        }), cur += insetRatio, curCount += 1;
    }
    return res;
}, splitArea = (area, count) => {
    var _a, _b;
    const attribute = area.attribute;
    let points = attribute.points;
    const segements = attribute.segments;
    points || (points = segements.reduce(((res, seg) => {
        var _a;
        return res.concat(null !== (_a = seg.points) && void 0 !== _a ? _a : []);
    }), []));
    const validatePoints = points.filter((point => !1 !== point.defined && (0, vutils_1.isNumber)(point.x) && (0, 
    vutils_1.isNumber)(point.y)));
    if (!validatePoints.length) return [];
    const allPoints = [];
    validatePoints.forEach((point => {
        allPoints.push({
            x: point.x,
            y: point.y
        });
    }));
    for (let i = validatePoints.length - 1; i >= 0; i--) {
        const point = validatePoints[i];
        allPoints.push({
            x: null !== (_a = point.x1) && void 0 !== _a ? _a : point.x,
            y: null !== (_b = point.y1) && void 0 !== _b ? _b : point.y
        });
    }
    const res = [];
    return (0, exports.recursiveCallBinarySplit)(points, count, res), res;
};

exports.splitArea = splitArea;

const splitLine = (line, count) => {
    const attribute = line.attribute, points = attribute.points;
    if (points) return samplingPoints(points, count);
    if (attribute.segments) {
        const allPoints = attribute.segments.reduce(((res, seg) => {
            var _a;
            return res.concat(null !== (_a = seg.points) && void 0 !== _a ? _a : []);
        }), []);
        return samplingPoints(allPoints, count);
    }
    return [];
};

function crossProduct(dir1, dir2) {
    return dir1[0] * dir2[1] - dir1[1] * dir2[0];
}

exports.splitLine = splitLine;

const clonePoints = points => points.map((p => ({
    x: p.x,
    y: p.y
}))), splitPolygonByLine = (points, p0, p1) => {
    const len = points.length, intersections = [];
    for (let i = 0; i < len; i++) {
        const cur = points[i], next = i === len - 1 ? points[0] : points[i + 1], res = (0, 
        vutils_1.getIntersectPoint)([ p0.x, p0.y ], [ p1.x, p1.y ], [ cur.x, cur.y ], [ next.x, next.y ]);
        res && "boolean" != typeof res && intersections.push({
            dot: crossProduct([ res[0] - p0.x, res[1] - p0.x ], [ p1.x - p0.x, p1.y - p0.x ]),
            point: {
                x: res[0],
                y: res[1]
            },
            edgeIndex: i
        });
    }
    if (intersections.length < 2) return [ clonePoints(points), clonePoints(points) ];
    intersections.sort(((a, b) => a.dot - b.dot));
    let is0 = intersections[0], is1 = intersections[intersections.length - 1];
    is0.edgeIndex > is1.edgeIndex && ([is0, is1] = [ is1, is0 ]);
    const newP0 = is0.point, newP1 = is1.point, newPointsA = [ {
        x: newP0.x,
        y: newP0.y
    } ];
    for (let i = is0.edgeIndex + 1; i <= is1.edgeIndex; i++) newPointsA.push({
        x: points[i].x,
        y: points[i].y
    });
    newPointsA.push({
        x: newP1.x,
        y: newP1.y
    });
    const newPointsB = [ {
        x: newP1.x,
        y: newP1.y
    } ];
    for (let i = is1.edgeIndex + 1, maxIndex = is0.edgeIndex + len; i <= maxIndex; i++) {
        const p = points[i % len];
        newPointsB.push({
            x: p.x,
            y: p.y
        });
    }
    return newPointsB.push({
        x: newP0.x,
        y: newP0.y
    }), [ newPointsA, newPointsB ];
}, binarySplitPolygon = points => {
    const box = new vutils_1.Bounds;
    points.forEach((point => {
        box.add(point.x, point.y);
    }));
    const width = box.width(), height = box.height();
    if (width >= height) {
        const midX = box.x1 + width / 2;
        return splitPolygonByLine(points, {
            x: midX,
            y: box.y1
        }, {
            x: midX,
            y: box.y2
        });
    }
    const midY = box.y1 + height / 2;
    return splitPolygonByLine(points, {
        x: box.x1,
        y: midY
    }, {
        x: box.x2,
        y: midY
    });
};

exports.binarySplitPolygon = binarySplitPolygon;

const recursiveCallBinarySplit = (points, count, out) => {
    if (1 === count) out.push({
        points: points
    }); else {
        const half = Math.floor(count / 2), res = (0, exports.binarySplitPolygon)(points);
        (0, exports.recursiveCallBinarySplit)(res[0], half, out), (0, exports.recursiveCallBinarySplit)(res[1], count - half, out);
    }
};

exports.recursiveCallBinarySplit = recursiveCallBinarySplit;

const splitPolygon = (polygon, count) => {
    const points = polygon.attribute.points;
    if (!points || !points.length) return [];
    if (1 === count) return [ {
        points: clonePoints(points)
    } ];
    const res = [];
    return (0, exports.recursiveCallBinarySplit)(points, count, res), res;
};

exports.splitPolygon = splitPolygon;

const splitPath = (path, count) => {
    const pathShape = path.getParsedPathShape(), bezierCurves = (0, morphing_utils_1.pathToBezierCurves)(pathShape);
    if (!bezierCurves.length || count < 0) return [];
    const subPathCnt = bezierCurves.length;
    if (bezierCurves.length >= count) {
        const res = [], stepCount = Math.floor(bezierCurves.length / count);
        for (let i = 0; i < count; i++) {
            const curves = bezierCurves.slice(i * stepCount, i === count - 1 ? subPathCnt : (i + 1) * stepCount);
            res.push({
                path: (0, morphing_utils_1.bezierCurversToPath)(curves)
            });
        }
        return res;
    }
    const res = [], stepCount = Math.floor(count / subPathCnt);
    let remain = count;
    for (let c = 0; c < subPathCnt; c++) {
        const points = [];
        for (let i = 2, len = bezierCurves[c].length; i < len; i += 2) points.push({
            x: bezierCurves[0][i],
            y: bezierCurves[0][i + 1]
        });
        (0, exports.recursiveCallBinarySplit)(points, c === subPathCnt - 1 ? remain : stepCount, res), 
        remain -= stepCount;
    }
    return res;
};

exports.splitPath = splitPath;
//# sourceMappingURL=split-path.js.map