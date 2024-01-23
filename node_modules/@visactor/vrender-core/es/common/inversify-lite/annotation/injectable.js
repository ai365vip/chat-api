import * as ERRORS_MSGS from "../constants/error_msgs";

import * as METADATA_KEY from "../constants/metadata_keys";

import Reflect from "../../Reflect-metadata";

function injectable() {
    return function(target) {
        if (Reflect.hasOwnMetadata(METADATA_KEY.PARAM_TYPES, target)) throw new Error(ERRORS_MSGS.DUPLICATED_INJECTABLE_DECORATOR);
        const types = Reflect.getMetadata(METADATA_KEY.DESIGN_PARAM_TYPES, target) || [];
        return Reflect.defineMetadata(METADATA_KEY.PARAM_TYPES, types, target), target;
    };
}

export { injectable };
//# sourceMappingURL=injectable.js.map
