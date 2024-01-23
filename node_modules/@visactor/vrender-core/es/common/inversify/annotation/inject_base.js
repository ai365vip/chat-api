import { Metadata } from "../meta-data";

import { TAGGED } from "../metadata_keys";

import Reflect from "../../Reflect-metadata";

function _tagParameterOrProperty(metadataKey, annotationTarget, key, metadata) {
    const metadatas = [ metadata ];
    let paramsOrPropertiesMetadata = {};
    Reflect.hasOwnMetadata(metadataKey, annotationTarget) && (paramsOrPropertiesMetadata = Reflect.getMetadata(metadataKey, annotationTarget));
    let paramOrPropertyMetadata = paramsOrPropertiesMetadata[key];
    void 0 === paramOrPropertyMetadata && (paramOrPropertyMetadata = []), paramOrPropertyMetadata.push(...metadatas), 
    paramsOrPropertiesMetadata[key] = paramOrPropertyMetadata, Reflect.defineMetadata(metadataKey, paramsOrPropertiesMetadata, annotationTarget);
}

function tagParameter(annotationTarget, parameterName, parameterIndex, metadata) {
    _tagParameterOrProperty(TAGGED, annotationTarget, parameterIndex.toString(), metadata);
}

export function createTaggedDecorator(metadata) {
    return (target, targetKey, indexOrPropertyDescriptor) => {
        tagParameter(target, targetKey, indexOrPropertyDescriptor, metadata);
    };
}

export function injectBase(metadataKey) {
    return serviceIdentifier => (target, targetKey, indexOrPropertyDescriptor) => createTaggedDecorator(new Metadata(metadataKey, serviceIdentifier))(target, targetKey, indexOrPropertyDescriptor);
}
//# sourceMappingURL=inject_base.js.map
