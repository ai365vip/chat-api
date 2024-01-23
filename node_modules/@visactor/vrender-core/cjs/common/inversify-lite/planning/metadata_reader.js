"use strict";

var __createBinding = this && this.__createBinding || (Object.create ? function(o, m, k, k2) {
    void 0 === k2 && (k2 = k);
    var desc = Object.getOwnPropertyDescriptor(m, k);
    desc && !("get" in desc ? !m.__esModule : desc.writable || desc.configurable) || (desc = {
        enumerable: !0,
        get: function() {
            return m[k];
        }
    }), Object.defineProperty(o, k2, desc);
} : function(o, m, k, k2) {
    void 0 === k2 && (k2 = k), o[k2] = m[k];
}), __setModuleDefault = this && this.__setModuleDefault || (Object.create ? function(o, v) {
    Object.defineProperty(o, "default", {
        enumerable: !0,
        value: v
    });
} : function(o, v) {
    o.default = v;
}), __importStar = this && this.__importStar || function(mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (null != mod) for (var k in mod) "default" !== k && Object.prototype.hasOwnProperty.call(mod, k) && __createBinding(result, mod, k);
    return __setModuleDefault(result, mod), result;
}, __importDefault = this && this.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : {
        default: mod
    };
};

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.MetadataReader = void 0;

const METADATA_KEY = __importStar(require("../constants/metadata_keys")), Reflect_metadata_1 = __importDefault(require("../../Reflect-metadata"));

class MetadataReader {
    getConstructorMetadata(constructorFunc) {
        return {
            compilerGeneratedMetadata: Reflect_metadata_1.default.getMetadata(METADATA_KEY.PARAM_TYPES, constructorFunc),
            userGeneratedMetadata: Reflect_metadata_1.default.getMetadata(METADATA_KEY.TAGGED, constructorFunc) || {}
        };
    }
    getPropertiesMetadata(constructorFunc) {
        return Reflect_metadata_1.default.getMetadata(METADATA_KEY.TAGGED_PROP, constructorFunc) || [];
    }
}

exports.MetadataReader = MetadataReader;
//# sourceMappingURL=metadata_reader.js.map
