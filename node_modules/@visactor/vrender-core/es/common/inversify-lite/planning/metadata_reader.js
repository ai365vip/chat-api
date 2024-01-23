import * as METADATA_KEY from "../constants/metadata_keys";

import Reflect from "../../Reflect-metadata";

class MetadataReader {
    getConstructorMetadata(constructorFunc) {
        return {
            compilerGeneratedMetadata: Reflect.getMetadata(METADATA_KEY.PARAM_TYPES, constructorFunc),
            userGeneratedMetadata: Reflect.getMetadata(METADATA_KEY.TAGGED, constructorFunc) || {}
        };
    }
    getPropertiesMetadata(constructorFunc) {
        return Reflect.getMetadata(METADATA_KEY.TAGGED_PROP, constructorFunc) || [];
    }
}

export { MetadataReader };
//# sourceMappingURL=metadata_reader.js.map
