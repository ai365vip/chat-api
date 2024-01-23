import * as ERROR_MSGS from "../constants/error_msgs";

import * as METADATA_KEY from "../constants/metadata_keys";

import { getFirstArrayDuplicate } from "../utils/js";

import Reflect from "../../Reflect-metadata";

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
        const duplicate = getFirstArrayDuplicate(metadatas.map((md => md.key)));
        if (void 0 !== duplicate) throw new Error(`${ERROR_MSGS.DUPLICATED_METADATA} ${duplicate.toString()}`);
    } else metadatas = [ metadata ];
    return metadatas;
}

function _tagParameterOrProperty(metadataKey, annotationTarget, key, metadata) {
    const metadatas = _ensureNoMetadataKeyDuplicates(metadata);
    let paramsOrPropertiesMetadata = {};
    Reflect.hasOwnMetadata(metadataKey, annotationTarget) && (paramsOrPropertiesMetadata = Reflect.getMetadata(metadataKey, annotationTarget));
    let paramOrPropertyMetadata = paramsOrPropertiesMetadata[key];
    if (void 0 === paramOrPropertyMetadata) paramOrPropertyMetadata = []; else for (const m of paramOrPropertyMetadata) if (metadatas.some((md => md.key === m.key))) throw new Error(`${ERROR_MSGS.DUPLICATED_METADATA} ${m.key.toString()}`);
    paramOrPropertyMetadata.push(...metadatas), paramsOrPropertiesMetadata[key] = paramOrPropertyMetadata, 
    Reflect.defineMetadata(metadataKey, paramsOrPropertiesMetadata, annotationTarget);
}

function createTaggedDecorator(metadata) {
    return (target, targetKey, indexOrPropertyDescriptor) => {
        "number" == typeof indexOrPropertyDescriptor ? tagParameter(target, targetKey, indexOrPropertyDescriptor, metadata) : tagProperty(target, targetKey, metadata);
    };
}

function _decorate(decorators, target) {
    Reflect.decorate(decorators, target);
}

function _param(paramIndex, decorator) {
    return function(target, key) {
        decorator(target, key, paramIndex);
    };
}

function decorate(decorator, target, parameterIndexOrProperty) {
    "number" == typeof parameterIndexOrProperty ? _decorate([ _param(parameterIndexOrProperty, decorator) ], target) : "string" == typeof parameterIndexOrProperty ? Reflect.decorate([ decorator ], target, parameterIndexOrProperty) : _decorate([ decorator ], target);
}

export { decorate, tagParameter, tagProperty, createTaggedDecorator };
//# sourceMappingURL=decorator_utils.js.map
