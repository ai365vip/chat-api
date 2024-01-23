"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.bezierCurversToPath = exports.applyTransformOnBezierCurves = exports.pathToBezierCurves = exports.alignBezierCurves = exports.findBestMorphingRotation = exports.centroidOfSubpath = exports.alignSubpath = exports.cubicSubdivide = void 0;

const vutils_1 = require("@visactor/vutils"), custom_path2d_1 = require("./custom-path2d"), path_svg_1 = require("./path-svg"), arc_1 = require("./shape/arc");

function cubicSubdivide(p0, p1, p2, p3, t, out) {
    const p01 = (p1 - p0) * t + p0, p12 = (p2 - p1) * t + p1, p23 = (p3 - p2) * t + p2, p012 = (p12 - p01) * t + p01, p123 = (p23 - p12) * t + p12, p0123 = (p123 - p012) * t + p012;
    out[0] = p0, out[1] = p01, out[2] = p012, out[3] = p0123, out[4] = p0123, out[5] = p123, 
    out[6] = p23, out[7] = p3;
}

function alignSubpath(subpath1, subpath2) {
    const len1 = subpath1.length, len2 = subpath2.length;
    if (len1 === len2) return [ subpath1, subpath2 ];
    const tmpSegX = [], tmpSegY = [], shorterPath = len1 < len2 ? subpath1 : subpath2, shorterLen = Math.min(len1, len2), diff = Math.abs(len2 - len1) / 6, shorterBezierCount = (shorterLen - 2) / 6, eachCurveSubDivCount = Math.ceil(diff / shorterBezierCount), newSubpath = [ shorterPath[0], shorterPath[1] ];
    let remained = diff;
    for (let i = 2; i < shorterLen; i += 6) {
        let x0 = shorterPath[i - 2], y0 = shorterPath[i - 1], x1 = shorterPath[i], y1 = shorterPath[i + 1], x2 = shorterPath[i + 2], y2 = shorterPath[i + 3];
        const x3 = shorterPath[i + 4], y3 = shorterPath[i + 5];
        if (remained <= 0) {
            newSubpath.push(x1, y1, x2, y2, x3, y3);
            continue;
        }
        const actualSubDivCount = Math.min(remained, eachCurveSubDivCount) + 1;
        for (let k = 1; k <= actualSubDivCount; k++) {
            const p = k / actualSubDivCount;
            cubicSubdivide(x0, x1, x2, x3, p, tmpSegX), cubicSubdivide(y0, y1, y2, y3, p, tmpSegY), 
            x0 = tmpSegX[3], y0 = tmpSegY[3], newSubpath.push(tmpSegX[1], tmpSegY[1], tmpSegX[2], tmpSegY[2], x0, y0), 
            x1 = tmpSegX[5], y1 = tmpSegY[5], x2 = tmpSegX[6], y2 = tmpSegY[6];
        }
        remained -= actualSubDivCount - 1;
    }
    return shorterPath === subpath1 ? [ newSubpath, subpath2 ] : [ subpath1, newSubpath ];
}

function createSubpath(lastSubpath, otherSubpath) {
    const prevSubPath = lastSubpath || otherSubpath, len = prevSubPath.length, lastX = prevSubPath[len - 2], lastY = prevSubPath[len - 1], newSubpath = [];
    for (let i = 0; i < otherSubpath.length; i += 2) newSubpath[i] = lastX, newSubpath[i + 1] = lastY;
    return newSubpath;
}

function reverseSubpath(array) {
    const newArr = [], len = array.length;
    for (let i = 0; i < len; i += 2) newArr[i] = array[len - i - 2], newArr[i + 1] = array[len - i - 1];
    return newArr;
}

function centroidOfSubpath(array) {
    let signedArea = 0, cx = 0, cy = 0;
    const len = array.length;
    for (let i = 0, j = len - 2; i < len; j = i, i += 2) {
        const x0 = array[j], y0 = array[j + 1], x1 = array[i], y1 = array[i + 1], a = x0 * y1 - x1 * y0;
        signedArea += a, cx += (x0 + x1) * a, cy += (y0 + y1) * a;
    }
    return 0 === signedArea ? [ array[0] || 0, array[1] || 0, 0 ] : [ cx / signedArea / 3, cy / signedArea / 3, signedArea ];
}

function findBestRotationOffset(fromSubBeziers, toSubBeziers, fromCp, toCp) {
    const bezierCount = (fromSubBeziers.length - 2) / 6;
    let bestScore = 1 / 0, bestOffset = 0;
    const len = fromSubBeziers.length, len2 = len - 2;
    for (let offset = 0; offset < bezierCount; offset++) {
        const cursorOffset = 6 * offset;
        let score = 0;
        for (let k = 0; k < len; k += 2) {
            const idx = 0 === k ? cursorOffset : (cursorOffset + k - 2) % len2 + 2, x0 = fromSubBeziers[idx] - fromCp[0], y0 = fromSubBeziers[idx + 1] - fromCp[1], dx = toSubBeziers[k] - toCp[0] - x0, dy = toSubBeziers[k + 1] - toCp[1] - y0;
            score += dx * dx + dy * dy;
        }
        score < bestScore && (bestScore = score, bestOffset = offset);
    }
    return bestOffset;
}

function findBestMorphingRotation(fromArr, toArr, searchAngleIteration, searchAngleRange) {
    const result = [];
    let fromNeedsReverse;
    for (let i = 0; i < fromArr.length; i++) {
        let fromSubpathBezier = fromArr[i];
        const toSubpathBezier = toArr[i], fromCp = centroidOfSubpath(fromSubpathBezier), toCp = centroidOfSubpath(toSubpathBezier);
        null == fromNeedsReverse && (fromNeedsReverse = fromCp[2] < 0 != toCp[2] < 0);
        const newFromSubpathBezier = [], newToSubpathBezier = [];
        let bestAngle = 0, bestScore = 1 / 0;
        const tmpArr = [], len = fromSubpathBezier.length;
        fromNeedsReverse && (fromSubpathBezier = reverseSubpath(fromSubpathBezier));
        const offset = 6 * findBestRotationOffset(fromSubpathBezier, toSubpathBezier, fromCp, toCp), len2 = len - 2;
        for (let k = 0; k < len2; k += 2) {
            const idx = (offset + k) % len2 + 2;
            newFromSubpathBezier[k + 2] = fromSubpathBezier[idx] - fromCp[0], newFromSubpathBezier[k + 3] = fromSubpathBezier[idx + 1] - fromCp[1];
        }
        if (newFromSubpathBezier[0] = fromSubpathBezier[offset] - fromCp[0], newFromSubpathBezier[1] = fromSubpathBezier[offset + 1] - fromCp[1], 
        searchAngleIteration > 0) {
            const step = searchAngleRange / searchAngleIteration;
            for (let angle = -searchAngleRange / 2; angle <= searchAngleRange / 2; angle += step) {
                const sa = Math.sin(angle), ca = Math.cos(angle);
                let score = 0;
                for (let k = 0; k < fromSubpathBezier.length; k += 2) {
                    const x0 = newFromSubpathBezier[k], y0 = newFromSubpathBezier[k + 1], x1 = toSubpathBezier[k] - toCp[0], y1 = toSubpathBezier[k + 1] - toCp[1], newX1 = x1 * ca - y1 * sa, newY1 = x1 * sa + y1 * ca;
                    tmpArr[k] = newX1, tmpArr[k + 1] = newY1;
                    const dx = newX1 - x0, dy = newY1 - y0;
                    score += dx * dx + dy * dy;
                }
                if (score < bestScore) {
                    bestScore = score, bestAngle = angle;
                    for (let m = 0; m < tmpArr.length; m++) newToSubpathBezier[m] = tmpArr[m];
                }
            }
        } else for (let i = 0; i < len; i += 2) newToSubpathBezier[i] = toSubpathBezier[i] - toCp[0], 
        newToSubpathBezier[i + 1] = toSubpathBezier[i + 1] - toCp[1];
        result.push({
            from: newFromSubpathBezier,
            to: newToSubpathBezier,
            fromCp: fromCp,
            toCp: toCp,
            rotation: -bestAngle
        });
    }
    return result;
}

function alignBezierCurves(array1, array2) {
    let lastSubpath1, lastSubpath2;
    const newArray1 = [], newArray2 = [];
    for (let i = 0; i < Math.max(array1.length, array2.length); i++) {
        const subpath1 = array1[i], subpath2 = array2[i];
        let newSubpath1, newSubpath2;
        subpath1 ? subpath2 ? ([newSubpath1, newSubpath2] = alignSubpath(subpath1, subpath2), 
        lastSubpath1 = newSubpath1, lastSubpath2 = newSubpath2) : (newSubpath2 = createSubpath(lastSubpath2, subpath1), 
        newSubpath1 = subpath1) : (newSubpath1 = createSubpath(lastSubpath1, subpath2), 
        newSubpath2 = subpath2), newArray1.push(newSubpath1), newArray2.push(newSubpath2);
    }
    return [ newArray1, newArray2 ];
}

exports.cubicSubdivide = cubicSubdivide, exports.alignSubpath = alignSubpath, exports.centroidOfSubpath = centroidOfSubpath, 
exports.findBestMorphingRotation = findBestMorphingRotation, exports.alignBezierCurves = alignBezierCurves;

const addLineToBezierPath = (bezierPath, x0, y0, x1, y1) => {
    (0, vutils_1.isNumberClose)(x0, x1) && (0, vutils_1.isNumberClose)(y0, y1) || bezierPath.push(x0, y0, x1, y1, x1, y1);
};

function pathToBezierCurves(path) {
    const commandList = path.commandList, bezierArrayGroups = [];
    let currentSubpath, xi = 0, yi = 0, x0 = 0, y0 = 0;
    const createNewSubpath = (x, y) => {
        currentSubpath && currentSubpath.length > 2 && bezierArrayGroups.push(currentSubpath), 
        currentSubpath = [ x, y ];
    };
    let x1, y1, x2, y2;
    for (let i = 0, len = commandList.length; i < len; i++) {
        const cmd = commandList[i], isFirst = 0 === i;
        switch (isFirst && (x0 = xi = cmd[1], y0 = yi = cmd[2], [ path_svg_1.enumCommandMap.L, path_svg_1.enumCommandMap.C, path_svg_1.enumCommandMap.Q ].includes(cmd[0]) && (currentSubpath = [ x0, y0 ])), 
        cmd[0]) {
          case path_svg_1.enumCommandMap.M:
            xi = x0 = cmd[1], yi = y0 = cmd[2], createNewSubpath(x0, y0);
            break;

          case path_svg_1.enumCommandMap.L:
            x1 = cmd[1], y1 = cmd[2], addLineToBezierPath(currentSubpath, xi, yi, x1, y1), xi = x1, 
            yi = y1;
            break;

          case path_svg_1.enumCommandMap.C:
            currentSubpath.push(cmd[1], cmd[2], cmd[3], cmd[4], xi = cmd[5], yi = cmd[6]);
            break;

          case path_svg_1.enumCommandMap.Q:
            x1 = cmd[1], y1 = cmd[2], x2 = cmd[3], y2 = cmd[4], currentSubpath.push(xi + 2 / 3 * (x1 - xi), yi + 2 / 3 * (y1 - yi), x2 + 2 / 3 * (x1 - x2), y2 + 2 / 3 * (y1 - y2), x2, y2), 
            xi = x2, yi = y2;
            break;

          case path_svg_1.enumCommandMap.A:
            {
                const cx = cmd[1], cy = cmd[2], rx = cmd[3], ry = rx, startAngle = cmd[4], endAngle = cmd[5], counterClockwise = !!cmd[6];
                x1 = Math.cos(startAngle) * rx + cx, y1 = Math.sin(startAngle) * rx + cy, isFirst ? (x0 = x1, 
                y0 = y1, createNewSubpath(x0, y0)) : addLineToBezierPath(currentSubpath, xi, yi, x1, y1), 
                xi = Math.cos(endAngle) * rx + cx, yi = Math.sin(endAngle) * rx + cy;
                const step = (counterClockwise ? -1 : 1) * Math.PI / 2;
                for (let angle = startAngle; counterClockwise ? angle > endAngle : angle < endAngle; angle += step) {
                    const nextAngle = counterClockwise ? Math.max(angle + step, endAngle) : Math.min(angle + step, endAngle);
                    (0, arc_1.addArcToBezierPath)(currentSubpath, angle, nextAngle, cx, cy, rx, ry);
                }
                break;
            }

          case path_svg_1.enumCommandMap.E:
            {
                const cx = cmd[1], cy = cmd[2], rx = cmd[3], ry = cmd[4], rotate = cmd[5], startAngle = cmd[6], endAngle = cmd[7] + startAngle, anticlockwise = !!cmd[8], hasRotate = !(0, 
                vutils_1.isNumberClose)(rotate, 0), rc = Math.cos(rotate), rs = Math.sin(rotate);
                let xTemp = Math.cos(startAngle) * rx, yTemp = Math.sin(startAngle) * ry;
                hasRotate ? (x1 = xTemp * rc - yTemp * rs + cx, y1 = xTemp * rs + yTemp * rc + cy) : (x1 = xTemp + cx, 
                y1 = yTemp + cy), isFirst ? (x0 = x1, y0 = y1, createNewSubpath(x0, y0)) : addLineToBezierPath(currentSubpath, xi, yi, x1, y1), 
                xTemp = Math.cos(endAngle) * rx, yTemp = Math.sin(endAngle) * ry, hasRotate ? (xi = xTemp * rc - yTemp * rs + cx, 
                yi = xTemp * rs + yTemp * rc + cy) : (xi = xTemp + cx, yi = yTemp + cy);
                const step = (anticlockwise ? -1 : 1) * Math.PI / 2;
                for (let angle = startAngle; anticlockwise ? angle > endAngle : angle < endAngle; angle += step) {
                    const nextAngle = anticlockwise ? Math.max(angle + step, endAngle) : Math.min(angle + step, endAngle);
                    if ((0, arc_1.addArcToBezierPath)(currentSubpath, angle, nextAngle, cx, cy, rx, ry), 
                    hasRotate) {
                        const curLen = currentSubpath.length;
                        for (let j = curLen - 6; j <= curLen - 1; j += 2) xTemp = currentSubpath[j], yTemp = currentSubpath[j + 1], 
                        currentSubpath[j] = (xTemp - cx) * rc - (yTemp - cy) * rs + cx, currentSubpath[j + 1] = (xTemp - cx) * rs + (yTemp - cy) * rc + cy;
                    }
                }
                break;
            }

          case path_svg_1.enumCommandMap.R:
            x0 = xi = cmd[1], y0 = yi = cmd[2], x1 = x0 + cmd[3], y1 = y0 + cmd[4], createNewSubpath(x1, y0), 
            addLineToBezierPath(currentSubpath, x1, y0, x1, y1), addLineToBezierPath(currentSubpath, x1, y1, x0, y1), 
            addLineToBezierPath(currentSubpath, x0, y1, x0, y0), addLineToBezierPath(currentSubpath, x0, y0, x1, y0);
            break;

          case path_svg_1.enumCommandMap.AT:
            {
                const tx1 = cmd[1], ty1 = cmd[2], tx2 = cmd[3], ty2 = cmd[4], r = cmd[5], dis1 = vutils_1.PointService.distancePP({
                    x: xi,
                    y: yi
                }, {
                    x: tx1,
                    y: ty1
                }), dis2 = vutils_1.PointService.distancePP({
                    x: tx2,
                    y: ty2
                }, {
                    x: tx1,
                    y: ty1
                }), theta = ((xi - tx1) * (tx2 - tx1) + (yi - ty1) * (ty2 - ty1)) / (dis1 * dis2), dis = r / Math.sin(theta / 2), midX = (xi + tx2 - 2 * tx1) / 2, midY = (yi + ty2 - 2 * ty1) / 2, midLen = vutils_1.PointService.distancePP({
                    x: midX,
                    y: midY
                }, {
                    x: 0,
                    y: 0
                }), cx = tx1 + dis * midX / midLen, cy = tx2 + dis * midY / midLen, disP = Math.sqrt(dis * dis - r * r);
                x0 = tx1 + disP * (xi - tx1) / dis1, y0 = ty1 + disP * (yi - ty1) / dis1, addLineToBezierPath(currentSubpath, xi, yi, x0, y0), 
                xi = tx1 + disP * (tx2 - tx1) / dis2, yi = ty1 + disP * (ty2 - ty1) / dis2;
                const startAngle = (0, vutils_1.getAngleByPoint)({
                    x: cx,
                    y: cy
                }, {
                    x: x0,
                    y: y0
                }), endAngle = (0, vutils_1.getAngleByPoint)({
                    x: cx,
                    y: cy
                }, {
                    x: xi,
                    y: yi
                });
                (0, arc_1.addArcToBezierPath)(currentSubpath, startAngle, endAngle, cx, cy, r, r);
                break;
            }

          case path_svg_1.enumCommandMap.Z:
            currentSubpath && addLineToBezierPath(currentSubpath, xi, yi, x0, y0), xi = x0, 
            yi = y0;
        }
    }
    return currentSubpath && currentSubpath.length > 2 && bezierArrayGroups.push(currentSubpath), 
    bezierArrayGroups;
}

function applyTransformOnBezierCurves(bezierCurves, martrix) {
    for (let i = 0; i < bezierCurves.length; i++) {
        const subPath = bezierCurves[i];
        for (let k = 0; k < subPath.length; k += 2) {
            const x = subPath[k], y = subPath[k + 1], res = {
                x: x,
                y: y
            };
            martrix.transformPoint({
                x: x,
                y: y
            }, res), subPath[k] = res.x, subPath[k + 1] = res.y;
        }
    }
}

function bezierCurversToPath(bezierCurves) {
    const path = new custom_path2d_1.CustomPath2D;
    for (let i = 0; i < bezierCurves.length; i++) {
        const subPath = bezierCurves[i];
        if (subPath.length > 2) {
            path.moveTo(subPath[0], subPath[1]);
            for (let k = 2; k < subPath.length; k += 6) path.bezierCurveTo(subPath[k], subPath[k + 1], subPath[k + 2], subPath[k + 3], subPath[k + 4], subPath[k + 5]);
        }
    }
    return path;
}

exports.pathToBezierCurves = pathToBezierCurves, exports.applyTransformOnBezierCurves = applyTransformOnBezierCurves, 
exports.bezierCurversToPath = bezierCurversToPath;
//# sourceMappingURL=morphing-utils.js.map