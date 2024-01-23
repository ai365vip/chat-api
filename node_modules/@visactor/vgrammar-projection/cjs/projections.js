"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.projection = exports.projectionProperties = exports.getProjectionPath = void 0;

const d3_geo_1 = require("d3-geo"), vgrammar_util_1 = require("@visactor/vgrammar-util"), vutils_1 = require("@visactor/vutils"), defaultPath = (0, 
d3_geo_1.geoPath)();

function getProjectionPath(proj) {
    return proj && proj.path || defaultPath;
}

exports.getProjectionPath = getProjectionPath;

const projections = {};

function create(type, constructor) {
    return function projectionGenerator() {
        const p = constructor();
        return p.type = type, p.path = (0, d3_geo_1.geoPath)().projection(p), p.copy = p.copy || function() {
            const c = projectionGenerator();
            return exports.projectionProperties.forEach((prop => {
                p[prop] && c[prop](p[prop]());
            })), c.path.pointRadius(p.path.pointRadius()), c;
        }, p;
    };
}

function projection(type, proj) {
    type && (0, vutils_1.isString)(type) || (0, vgrammar_util_1.error)("Projection type must be a name string.");
    const projectionType = type.toLowerCase();
    return arguments.length > 1 && (projections[projectionType] = create(projectionType, proj)), 
    projections[projectionType] || null;
}

exports.projectionProperties = [ "clipAngle", "clipExtent", "scale", "translate", "center", "rotate", "precision", "reflectX", "reflectY", "parallels", "coefficient", "distance", "fraction", "lobes", "parallel", "radius", "ratio", "spacing", "tilt" ], 
exports.projection = projection;

const builtInProjections = {
    albers: d3_geo_1.geoAlbers,
    albersusa: d3_geo_1.geoAlbersUsa,
    azimuthalequalarea: d3_geo_1.geoAzimuthalEqualArea,
    azimuthalequidistant: d3_geo_1.geoAzimuthalEquidistant,
    conicconformal: d3_geo_1.geoConicConformal,
    conicequalarea: d3_geo_1.geoConicEqualArea,
    conicequidistant: d3_geo_1.geoConicEquidistant,
    equalEarth: d3_geo_1.geoEqualEarth,
    equirectangular: d3_geo_1.geoEquirectangular,
    gnomonic: d3_geo_1.geoGnomonic,
    identity: d3_geo_1.geoIdentity,
    mercator: d3_geo_1.geoMercator,
    naturalEarth1: d3_geo_1.geoNaturalEarth1,
    orthographic: d3_geo_1.geoOrthographic,
    stereographic: d3_geo_1.geoStereographic,
    transversemercator: d3_geo_1.geoTransverseMercator
};

Object.keys(builtInProjections).forEach((projectionType => {
    projection(projectionType, builtInProjections[projectionType]);
}));
//# sourceMappingURL=projections.js.map