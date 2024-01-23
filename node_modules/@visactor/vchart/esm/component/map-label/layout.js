import { isPointInPolygon, destination, getAABBFromPoints } from "@visactor/vutils";

function overlap(a, b, sep = 0) {
    return sep > Math.max(b.x1 - a.x2, a.x1 - b.x2, b.y1 - a.y2, a.y1 - b.y2);
}

export function bound(rect) {
    return {
        x1: rect.x,
        x2: rect.x + rect.width,
        y1: rect.y,
        y2: rect.y + rect.height
    };
}

function toRect(bound) {
    return {
        x: bound.x1,
        y: bound.y1,
        width: bound.x2 - bound.x1,
        height: bound.y2 - bound.y1
    };
}

export function layoutByPosition(pairs) {
    var _a;
    if (!pairs || 0 === pairs.length) return [];
    if (1 === pairs.length) return [ pairs[0].rect ];
    const _pairs = pairs.map((pair => {
        var _a;
        return Object.assign(Object.assign({}, pair), {
            bound: bound(pair.rect),
            anchorCandidates: candidatesByOrient(null !== (_a = pair.anchors) && void 0 !== _a ? _a : [], pair.point, pair.rect, pair.offset)
        });
    })), resultBound = [];
    resultBound.push(_pairs[0].bound);
    for (let i = 1; i <= _pairs.length - 1; i++) {
        const curPair = _pairs[i], curBound = curPair.bound;
        let isOverlap = resultBound.some((r => overlap(r, curBound)));
        if (curPair.anchorCandidates) if (isOverlap && (null === (_a = curPair.anchorCandidates) || void 0 === _a ? void 0 : _a.length) > 0) {
            for (let j = 0; j < curPair.anchorCandidates.length; j++) {
                const anchor = curPair.anchorCandidates[j], newBound = {
                    x1: anchor.x,
                    y1: anchor.y,
                    x2: anchor.x + curBound.x2 - curBound.x1,
                    y2: anchor.y + curBound.y2 - curBound.y1,
                    anchor: anchor
                };
                if (!resultBound.some((r => overlap(r, newBound)))) {
                    resultBound.push(newBound), isOverlap = !1;
                    break;
                }
            }
            isOverlap && resultBound.push(curPair.bound);
        } else resultBound.push(curPair.bound);
    }
    return resultBound.map((bound => toRect(bound)));
}

export function layoutOuter(pairs, features, dataToPosition) {
    const _points = pairs.map((rect => rect.pointCoord)), {x1: x1, x2: x2, y1: y1, y2: y2} = getAABBFromPoints(_points), centerPosition = dataToPosition([ (x1 + x2) / 2, (y1 + y2) / 2 ]);
    if (!centerPosition) return [];
    return layoutByPosition(pairs.map((pair => {
        const rect = pair.rect, targetPoint = isPointWithinFeatures(features, pair.pointCoord) ? dataToPosition(nearestPoint(features, [ pair.pointCoord.x, pair.pointCoord.y ], uniformDegree(lineDegree(pair.point, centerPosition)))) : pair.point;
        targetPoint && (rect.x = targetPoint.x, rect.y = targetPoint.y);
        const degree = uniformDegree(lineDegree(pair.point, centerPosition));
        let position;
        const anchors = [];
        return degree >= -45 && degree < 45 ? (position = "top", anchors.push("left", "right")) : degree >= 45 && degree < 135 ? position = "right" : degree >= -135 && degree < -45 ? (position = "left", 
        anchors.push("left")) : (position = "bottom", anchors.push("left", "right")), pair.anchors = anchors, 
        pair.offset = 20, pair.rect = placeRectByOrient(pair.rect, position, 0), pair;
    })));
}

export function layoutOuter2(pairs, features, dataToPosition) {
    let x = 0, y = 0;
    for (let i = 0; i < pairs.length; i++) x += pairs[i].pointCoord.x, y += pairs[i].pointCoord.y;
    x /= pairs.length, y /= pairs.length;
    const centerPosition = dataToPosition([ x, y ]);
    if (!centerPosition) return [];
    const count = pairs.length;
    pairs.sort(((a, b) => lineDegree(centerPosition, a.point) - lineDegree(centerPosition, b.point)));
    return layoutByPosition(pairs.map(((pair, index) => {
        let degree = 360 / count * index;
        degree = uniformDegree((degree + lineDegree(centerPosition, pair.point)) / 2);
        const targetPoint = isPointWithinFeatures(features, pair.pointCoord) ? dataToPosition(nearestPoint(features, [ pair.pointCoord.x, pair.pointCoord.y ], degree)) : pair.point;
        let position;
        targetPoint && (pair.rect.x = targetPoint.x, pair.rect.y = targetPoint.y);
        const anchors = [];
        return degree >= -45 && degree < 45 ? (position = "top", anchors.push("left", "right")) : degree >= 45 && degree < 135 ? position = "right" : degree >= -135 && degree < -45 ? (position = "left", 
        anchors.push("left")) : (position = "bottom", anchors.push("left", "right")), pair.anchors = anchors, 
        pair.offset = 20, pair.rect = placeRectByOrient(pair.rect, position, 0), pair;
    })).sort(((a, b) => a.index - b.index)));
}

function uniformDegree(degree) {
    return degree > 180 ? degree - 360 : degree;
}

function lineDegree(start, end) {
    return 180 * Math.atan2(start.y - end.y, start.x - end.x) / Math.PI + 90;
}

function nearestPoint(features, origin, bearing, distance = 200) {
    const count = 5621 / distance;
    let curOrigin = origin;
    for (let i = 1; i <= count; i++) {
        const dest = destination(curOrigin, distance, bearing);
        if (!isPointWithinFeatures(features, dest)) return [ dest.x, dest.y ];
        curOrigin = [ dest.x, dest.y ];
    }
    return origin;
}

function isPointWithinFeatures(features, p) {
    for (let i = 0; i < features.length; i++) {
        if (isPointInPolygon(p, features[i])) return !0;
    }
    return !1;
}

export function placeRectByOrient(rect, position, offset = 0) {
    const result = Object.assign({}, rect);
    return "top" === position ? (result.x -= rect.width / 2, result.y -= offset + rect.height / 2) : "bottom" === position ? (result.x -= rect.width / 2, 
    result.y += offset - rect.height / 2) : "left" === position ? (result.x -= offset + rect.width, 
    result.y -= rect.height / 2) : "right" === position && (result.x += offset, result.y -= rect.height / 2), 
    result;
}

export function candidatesByOrient(positions, anchor, rect, offset = 0) {
    const candidates = [];
    return positions.forEach((p => {
        const {x: x, y: y} = placeRectByOrient(Object.assign(Object.assign({}, anchor), {
            width: rect.width,
            height: rect.height
        }), p, offset);
        candidates.push({
            x: x,
            y: y
        });
    })), candidates;
}
//# sourceMappingURL=layout.js.map
