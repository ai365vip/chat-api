import * as METADATA_KEY from "../metadata_keys";

import Reflect from "../../Reflect-metadata";

export function injectable() {
    return function(target) {
        return Reflect.defineMetadata(METADATA_KEY.PARAM_TYPES, null, target), target;
    };
}
//# sourceMappingURL=injectable.js.map
