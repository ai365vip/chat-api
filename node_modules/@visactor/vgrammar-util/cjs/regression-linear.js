"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.regressionLinear = exports.rSquared = exports.visitPoints = exports.ordinaryLeastSquares = void 0;

const vutils_1 = require("@visactor/vutils");

function ordinaryLeastSquares(uX, uY, uXY, uX2) {
    const delta = uX2 - uX * uX, slope = Math.abs(delta) < 1e-24 ? 0 : (uXY - uX * uY) / delta;
    return [ uY - slope * uX, slope ];
}

function visitPoints(data, x, y, callback) {
    let u, v, i = -1;
    data.forEach((d => {
        u = x(d), v = y(d), !(0, vutils_1.isNil)(u) && (u = +u) >= u && !(0, vutils_1.isNil)(v) && (v = +v) >= v && callback(u, v, ++i);
    }));
}

function rSquared(data, x, y, uY, predict) {
    let SSE = 0, SST = 0;
    return visitPoints(data, x, y, ((dx, dy) => {
        const sse = dy - predict(dx), sst = dy - uY;
        SSE += sse * sse, SST += sst * sst;
    })), 1 - SSE / SST;
}

function regressionLinear(data, x = (datum => datum.x), y = (datum => datum.y)) {
    let X = 0, Y = 0, XY = 0, X2 = 0, n = 0;
    visitPoints(data, x, y, ((dx, dy) => {
        ++n, X += (dx - X) / n, Y += (dy - Y) / n, XY += (dx * dy - XY) / n, X2 += (dx * dx - X2) / n;
    }));
    const coef = ordinaryLeastSquares(X, Y, XY, X2), predict = x => coef[0] + coef[1] * x;
    return {
        coef: coef,
        predict: predict,
        rSquared: rSquared(data, x, y, Y, predict)
    };
}

exports.ordinaryLeastSquares = ordinaryLeastSquares, exports.visitPoints = visitPoints, 
exports.rSquared = rSquared, exports.regressionLinear = regressionLinear;
//# sourceMappingURL=regression-linear.js.map