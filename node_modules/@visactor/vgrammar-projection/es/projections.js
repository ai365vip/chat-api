import { geoAlbers, geoAlbersUsa, geoAzimuthalEqualArea, geoAzimuthalEquidistant, geoConicConformal, geoConicEqualArea, geoConicEquidistant, geoEqualEarth, geoEquirectangular, geoGnomonic, geoIdentity, geoMercator, geoNaturalEarth1, geoOrthographic, geoStereographic, geoTransverseMercator, geoPath } from "d3-geo";

import { error } from "@visactor/vgrammar-util";

import { isString } from "@visactor/vutils";

const defaultPath = geoPath();

export function getProjectionPath(proj) {
    return proj && proj.path || defaultPath;
}

const projections = {};

export const projectionProperties = [ "clipAngle", "clipExtent", "scale", "translate", "center", "rotate", "precision", "reflectX", "reflectY", "parallels", "coefficient", "distance", "fraction", "lobes", "parallel", "radius", "ratio", "spacing", "tilt" ];

function create(type, constructor) {
    return function projectionGenerator() {
        const p = constructor();
        return p.type = type, p.path = geoPath().projection(p), p.copy = p.copy || function() {
            const c = projectionGenerator();
            return projectionProperties.forEach((prop => {
                p[prop] && c[prop](p[prop]());
            })), c.path.pointRadius(p.path.pointRadius()), c;
        }, p;
    };
}

export function projection(type, proj) {
    type && isString(type) || error("Projection type must be a name string.");
    const projectionType = type.toLowerCase();
    return arguments.length > 1 && (projections[projectionType] = create(projectionType, proj)), 
    projections[projectionType] || null;
}

const builtInProjections = {
    albers: geoAlbers,
    albersusa: geoAlbersUsa,
    azimuthalequalarea: geoAzimuthalEqualArea,
    azimuthalequidistant: geoAzimuthalEquidistant,
    conicconformal: geoConicConformal,
    conicequalarea: geoConicEqualArea,
    conicequidistant: geoConicEquidistant,
    equalEarth: geoEqualEarth,
    equirectangular: geoEquirectangular,
    gnomonic: geoGnomonic,
    identity: geoIdentity,
    mercator: geoMercator,
    naturalEarth1: geoNaturalEarth1,
    orthographic: geoOrthographic,
    stereographic: geoStereographic,
    transversemercator: geoTransverseMercator
};

Object.keys(builtInProjections).forEach((projectionType => {
    projection(projectionType, builtInProjections[projectionType]);
}));
//# sourceMappingURL=projections.js.map