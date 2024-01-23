"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.registerGeoTransforms = exports.Projection = exports.registerProjection = exports.getProjectionPath = exports.projectionProperties = exports.projection = void 0;

const vgrammar_core_1 = require("@visactor/vgrammar-core");

var projections_1 = require("./projections");

Object.defineProperty(exports, "projection", {
    enumerable: !0,
    get: function() {
        return projections_1.projection;
    }
}), Object.defineProperty(exports, "projectionProperties", {
    enumerable: !0,
    get: function() {
        return projections_1.projectionProperties;
    }
}), Object.defineProperty(exports, "getProjectionPath", {
    enumerable: !0,
    get: function() {
        return projections_1.getProjectionPath;
    }
});

const projection_1 = require("./projection");

Object.defineProperty(exports, "Projection", {
    enumerable: !0,
    get: function() {
        return projection_1.Projection;
    }
});

const geo_path_1 = require("./geo-path"), registerProjection = () => {
    vgrammar_core_1.Factory.registerGrammar("projection", projection_1.Projection, "projections");
};

exports.registerProjection = registerProjection;

const registerGeoTransforms = () => {
    vgrammar_core_1.Factory.registerTransform("geoPath", {
        transform: geo_path_1.transform,
        markPhase: "beforeJoin"
    }, !0);
};

exports.registerGeoTransforms = registerGeoTransforms;
//# sourceMappingURL=index.js.map