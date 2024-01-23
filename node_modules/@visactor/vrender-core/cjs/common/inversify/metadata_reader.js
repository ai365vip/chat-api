"use strict";

var __importDefault = this && this.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : {
        default: mod
    };
};

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.MetadataReader = void 0;

const Reflect_metadata_1 = __importDefault(require("../Reflect-metadata")), metadata_keys_1 = require("./metadata_keys");

class MetadataReader {
    getConstructorMetadata(constructorFunc) {
        return {
            compilerGeneratedMetadata: Reflect_metadata_1.default.getMetadata(metadata_keys_1.PARAM_TYPES, constructorFunc),
            userGeneratedMetadata: Reflect_metadata_1.default.getMetadata(metadata_keys_1.TAGGED, constructorFunc) || {}
        };
    }
    getPropertiesMetadata(constructorFunc) {
        throw new Error("暂未实现");
    }
}

exports.MetadataReader = MetadataReader;
//# sourceMappingURL=metadata_reader.js.map
