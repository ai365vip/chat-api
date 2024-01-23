"use strict";

var __importDefault = this && this.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : {
        default: mod
    };
};

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.injectBase = exports.createTaggedDecorator = void 0;

const meta_data_1 = require("../meta-data"), metadata_keys_1 = require("../metadata_keys"), Reflect_metadata_1 = __importDefault(require("../../Reflect-metadata"));

function _tagParameterOrProperty(metadataKey, annotationTarget, key, metadata) {
    const metadatas = [ metadata ];
    let paramsOrPropertiesMetadata = {};
    Reflect_metadata_1.default.hasOwnMetadata(metadataKey, annotationTarget) && (paramsOrPropertiesMetadata = Reflect_metadata_1.default.getMetadata(metadataKey, annotationTarget));
    let paramOrPropertyMetadata = paramsOrPropertiesMetadata[key];
    void 0 === paramOrPropertyMetadata && (paramOrPropertyMetadata = []), paramOrPropertyMetadata.push(...metadatas), 
    paramsOrPropertiesMetadata[key] = paramOrPropertyMetadata, Reflect_metadata_1.default.defineMetadata(metadataKey, paramsOrPropertiesMetadata, annotationTarget);
}

function tagParameter(annotationTarget, parameterName, parameterIndex, metadata) {
    _tagParameterOrProperty(metadata_keys_1.TAGGED, annotationTarget, parameterIndex.toString(), metadata);
}

function createTaggedDecorator(metadata) {
    return (target, targetKey, indexOrPropertyDescriptor) => {
        tagParameter(target, targetKey, indexOrPropertyDescriptor, metadata);
    };
}

function injectBase(metadataKey) {
    return serviceIdentifier => (target, targetKey, indexOrPropertyDescriptor) => createTaggedDecorator(new meta_data_1.Metadata(metadataKey, serviceIdentifier))(target, targetKey, indexOrPropertyDescriptor);
}

exports.createTaggedDecorator = createTaggedDecorator, exports.injectBase = injectBase;
//# sourceMappingURL=inject_base.js.map
