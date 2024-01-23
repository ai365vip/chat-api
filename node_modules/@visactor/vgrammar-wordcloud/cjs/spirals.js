"use strict";

function archimedeanSpiral(size) {
    const e = size[0] / size[1];
    return t => [ e * (t *= .1) * Math.cos(t), t * Math.sin(t) ];
}

function rectangularSpiral(size) {
    const dx = 4 * size[0] / size[1];
    let x = 0, y = 0;
    return t => {
        const sign = t < 0 ? -1 : 1;
        switch (Math.sqrt(1 + 4 * sign * t) - sign & 3) {
          case 0:
            x += dx;
            break;

          case 1:
            y += 4;
            break;

          case 2:
            x -= dx;
            break;

          default:
            y -= 4;
        }
        return [ x, y ];
    };
}

//# sourceMappingURL=spirals.js.map
Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.spirals = void 0, exports.spirals = {
    archimedean: archimedeanSpiral,
    rectangular: rectangularSpiral
};