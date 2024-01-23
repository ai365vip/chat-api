import geoSimplify from "simplify-geojson";

import { mergeDeepImmer } from "../../utils/js";

const DEFAULT_SIMPLIFY_OPTIONS = {
    tolerance: .01
};

export const simplify = (data, options) => {
    const mergeOptions = mergeDeepImmer(DEFAULT_SIMPLIFY_OPTIONS, options), {tolerance: tolerance} = mergeOptions;
    return geoSimplify(data, tolerance);
};
//# sourceMappingURL=simplify.js.map