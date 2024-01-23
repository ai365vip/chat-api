import * as METADATA_KEY from "../constants/metadata_keys";

import { Metadata } from "../planning/metadata";

const taggedConstraint = key => value => {
    const constraint = request => null !== request && null !== request.target && request.target.matchesTag(key)(value);
    return constraint.metaData = new Metadata(key, value), constraint;
}, namedConstraint = taggedConstraint(METADATA_KEY.NAMED_TAG);

export { namedConstraint };
//# sourceMappingURL=constraint_helpers.js.map
