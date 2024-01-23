"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.configureCoordinate = exports.parseCoordinate = exports.createCoordinate = void 0;

const vutils_1 = require("@visactor/vutils"), vgrammar_coordinate_1 = require("@visactor/vgrammar-coordinate"), util_1 = require("./util");

function createCoordinate(type) {
    switch (type) {
      case "cartesian":
      default:
        return new vgrammar_coordinate_1.CartesianCoordinate;

      case "polar":
        return new vgrammar_coordinate_1.PolarCoordinate;
    }
}

function parseCoordinate(spec, view) {
    let dependencies = [];
    return [ "start", "end", "origin", "translate", "rotate", "scale", "transpose" ].forEach((key => {
        dependencies = dependencies.concat((0, util_1.parseFunctionType)(spec[key], view));
    })), dependencies;
}

function configureCoordinate(spec, coordinate, parameters) {
    var _a, _b, _c, _d, _e, _f, _g;
    !(0, vutils_1.isNil)(spec.start) && coordinate.start(null !== (_a = (0, util_1.invokeFunctionType)(spec.start, parameters)) && void 0 !== _a ? _a : [ 0, 0 ]), 
    !(0, vutils_1.isNil)(spec.end) && coordinate.end(null !== (_b = (0, util_1.invokeFunctionType)(spec.end, parameters)) && void 0 !== _b ? _b : [ 0, 0 ]), 
    !(0, vutils_1.isNil)(spec.origin) && coordinate.origin(null !== (_c = (0, util_1.invokeFunctionType)(spec.origin, parameters)) && void 0 !== _c ? _c : [ 0, 0 ]);
    const transforms = [];
    if (!(0, vutils_1.isNil)(spec.translate)) {
        const translate = (0, util_1.invokeFunctionType)(spec.translate, parameters);
        transforms.push({
            type: "translate",
            offset: {
                x: null !== (_d = null == translate ? void 0 : translate[0]) && void 0 !== _d ? _d : 0,
                y: null !== (_e = null == translate ? void 0 : translate[1]) && void 0 !== _e ? _e : 0
            }
        });
    }
    if (!(0, vutils_1.isNil)(spec.rotate)) {
        const rotate = (0, util_1.invokeFunctionType)(spec.rotate, parameters);
        transforms.push({
            type: "rotate",
            angle: null != rotate ? rotate : 0
        });
    }
    if (!(0, vutils_1.isNil)(spec.scale)) {
        const scale = (0, util_1.invokeFunctionType)(spec.scale, parameters);
        transforms.push({
            type: "scale",
            scale: {
                x: null !== (_f = null == scale ? void 0 : scale[0]) && void 0 !== _f ? _f : 1,
                y: null !== (_g = null == scale ? void 0 : scale[1]) && void 0 !== _g ? _g : 1
            }
        });
    }
    if (!(0, vutils_1.isNil)(spec.transpose)) {
        (0, util_1.invokeFunctionType)(spec.transpose, parameters) && transforms.push({
            type: "transpose"
        });
    }
    coordinate.applyTransforms(transforms);
}

exports.createCoordinate = createCoordinate, exports.parseCoordinate = parseCoordinate, 
exports.configureCoordinate = configureCoordinate;
//# sourceMappingURL=coordinate.js.map
