import { Metadata } from "../meta-data";

import { NAMED_TAG } from "../metadata_keys";

const taggedConstraint = key => value => {
    const constraint = request => {
        if (null == request) return !1;
        if (request.key === key && request.value === value) return !0;
        if (null == request.constructorArgsMetadata) return !1;
        const constructorArgsMetadata = request.constructorArgsMetadata;
        for (let i = 0; i < constructorArgsMetadata.length; i++) if (constructorArgsMetadata[i].key === key && constructorArgsMetadata[i].value === value) return !0;
        return !1;
    };
    return constraint.metaData = new Metadata(key, value), constraint;
};

export const namedConstraint = taggedConstraint(NAMED_TAG);
//# sourceMappingURL=constraint_helpers.js.map
