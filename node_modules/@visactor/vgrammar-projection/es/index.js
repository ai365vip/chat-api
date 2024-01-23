import { Factory } from "@visactor/vgrammar-core";

export { projection, projectionProperties, getProjectionPath } from "./projections";

import { Projection } from "./projection";

import { transform as geoPathTransform } from "./geo-path";

export const registerProjection = () => {
    Factory.registerGrammar("projection", Projection, "projections");
};

export { Projection };

export const registerGeoTransforms = () => {
    Factory.registerTransform("geoPath", {
        transform: geoPathTransform,
        markPhase: "beforeJoin"
    }, !0);
};
//# sourceMappingURL=index.js.map