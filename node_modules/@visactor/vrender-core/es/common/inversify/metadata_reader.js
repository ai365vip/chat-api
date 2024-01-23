import Reflect from "../Reflect-metadata";

import { PARAM_TYPES, TAGGED } from "./metadata_keys";

class MetadataReader {
    getConstructorMetadata(constructorFunc) {
        return {
            compilerGeneratedMetadata: Reflect.getMetadata(PARAM_TYPES, constructorFunc),
            userGeneratedMetadata: Reflect.getMetadata(TAGGED, constructorFunc) || {}
        };
    }
    getPropertiesMetadata(constructorFunc) {
        throw new Error("暂未实现");
    }
}

export { MetadataReader };
//# sourceMappingURL=metadata_reader.js.map
