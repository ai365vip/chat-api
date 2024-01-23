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
}), exports.createTaggedDecorator = exports.tagProperty = exports.tagParameter = exports.decorate = void 0;

const ERROR_MSGS = __importStar(require("../constants/error_msgs")), METADATA_KEY = __importStar(require("../constants/metadata_keys")), js_1 = require("../utils/js"), Reflect_metadata_1 = __importDefault(require("../../Reflect-metadata"));

function targetIsConstructorFunction(target) {
    return void 0 !== target.prototype;
}

function _throwIfMethodParameter(parameterName) {
    if (void 0 !== parameterName) throw new Error(ERROR_MSGS.INVALID_DECORATOR_OPERATION);
}

function tagParameter(annotationTarget, parameterName, parameterIndex, metadata) {
    _throwIfMethodParameter(parameterName), _tagParameterOrProperty(METADATA_KEY.TAGGED, annotationTarget, parameterIndex.toString(), metadata);
}

function tagProperty(annotationTarget, propertyName, metadata) {
    if (targetIsConstructorFunction(annotationTarget)) throw new Error(ERROR_MSGS.INVALID_DECORATOR_OPERATION);
    _tagParameterOrProperty(METADATA_KEY.TAGGED_PROP, annotationTarget.constructor, propertyName, metadata);
}

function _ensureNoMetadataKeyDuplicates(metadata) {
    let metadatas = [];
    if (Array.isArray(metadata)) {
        metadatas = metadata;
        const duplicate = (0, js_1.getFirstArrayDuplicate)(metadatas.map((md => md.key)));
        if (void 0 !== duplicate) throw new Error(`${ERROR_MSGS.DUPLICATED_METADATA} ${duplicate.toString()}`);
    } else metadatas = [ metadata ];
    return metadatas;
}

function _tagParameterOrProperty(metadataKey, annotationTarget, key, metadata) {
    const metadatas = _ensureNoMetadataKeyDuplicates(metadata);
    let paramsOrPropertiesMetadata = {};
    Reflect_metadata_1.default.hasOwnMetadata(metadataKey, annotationTarget) && (paramsOrPropertiesMetadata = Reflect_metadata_1.default.getMetadata(metadataKey, annotationTarget));
    let paramOrPropertyMetadata = paramsOrPropertiesMetadata[key];
    if (void 0 === paramOrPropertyMetadata) paramOrPropertyMetadata = []; else for (const m of paramOrPropertyMetadata) if (metadatas.some((md => md.key === m.key))) throw new Error(`${ERROR_MSGS.DUPLICATED_METADATA} ${m.key.toString()}`);
    paramOrPropertyMetadata.push(...metadatas), paramsOrPropertiesMetadata[key] = paramOrPropertyMetadata, 
    Reflect_metadata_1.default.defineMetadata(metadataKey, paramsOrPropertiesMetadata, annotationTarget);
}

function createTaggedDecorator(metadata) {
    return (target, targetKey, indexOrPropertyDescriptor) => {
        "number" == typeof indexOrPropertyDescriptor ? tagParameter(target, targetKey, indexOrPropertyDescriptor, metadata) : tagProperty(target, targetKey, metadata);
    };
}

function _decorate(decorators, target) {
    Reflect_metadata_1.default.decorate(decorators, target);
}

function _param(paramIndex, decorator) {
    return function(target, key) {
        decorator(target, key, paramIndex);
    };
}

function decorate(decorator, target, parameterIndexOrProperty) {
    "number" == typeof parameterIndexOrProperty ? _decorate([ _param(parameterIndexOrProperty, decorator) ], target) : "string" == typeof parameterIndexOrProperty ? Reflect_metadata_1.default.decorate([ decorator ], target, parameterIndexOrProperty) : _decorate([ decorator ], target);
}

exports.tagParameter = tagParameter, exports.tagProperty = tagProperty, exports.createTaggedDecorator = createTaggedDecorator, 
exports.decorate = decorate;
//# sourceMappingURL=decorator_utils.js.map
