import { LazyServiceIdentifer } from "../annotation/lazy_service_identifier";

import * as ERROR_MSGS from "../constants/error_msgs";

import { TargetTypeEnum } from "../constants/literal_types";

import * as METADATA_KEY from "../constants/metadata_keys";

import { getFunctionName } from "../utils/serialization";

import { Target } from "./target";

function getDependencies(metadataReader, func) {
    return getTargets(metadataReader, getFunctionName(func), func, !1);
}

function getTargets(metadataReader, constructorName, func, isBaseClass) {
    const metadata = metadataReader.getConstructorMetadata(func), serviceIdentifiers = metadata.compilerGeneratedMetadata;
    if (void 0 === serviceIdentifiers) {
        const msg = `${ERROR_MSGS.MISSING_INJECTABLE_ANNOTATION} ${constructorName}.`;
        throw new Error(msg);
    }
    const constructorArgsMetadata = metadata.userGeneratedMetadata, keys = Object.keys(constructorArgsMetadata), hasUserDeclaredUnknownInjections = 0 === func.length && keys.length > 0, hasOptionalParameters = keys.length > func.length;
    return [ ...getConstructorArgsAsTargets(isBaseClass, constructorName, serviceIdentifiers, constructorArgsMetadata, hasUserDeclaredUnknownInjections || hasOptionalParameters ? keys.length : func.length), ...getClassPropsAsTargets(metadataReader, func, constructorName) ];
}

function getConstructorArgsAsTarget(index, isBaseClass, constructorName, serviceIdentifiers, constructorArgsMetadata) {
    const targetMetadata = constructorArgsMetadata[index.toString()] || [], metadata = formatTargetMetadata(targetMetadata), isManaged = !0 !== metadata.unmanaged;
    let serviceIdentifier = serviceIdentifiers[index];
    const injectIdentifier = metadata.inject || metadata.multiInject;
    if (serviceIdentifier = injectIdentifier || serviceIdentifier, serviceIdentifier instanceof LazyServiceIdentifer && (serviceIdentifier = serviceIdentifier.unwrap()), 
    isManaged) {
        if (!isBaseClass && (serviceIdentifier === Object || serviceIdentifier === Function || void 0 === serviceIdentifier)) {
            const msg = `${ERROR_MSGS.MISSING_INJECT_ANNOTATION} argument ${index} in class ${constructorName}.`;
            throw new Error(msg);
        }
        const target = new Target(TargetTypeEnum.ConstructorArgument, metadata.targetName, serviceIdentifier);
        return target.metadata = targetMetadata, target;
    }
    return null;
}

function getConstructorArgsAsTargets(isBaseClass, constructorName, serviceIdentifiers, constructorArgsMetadata, iterations) {
    const targets = [];
    for (let i = 0; i < iterations; i++) {
        const target = getConstructorArgsAsTarget(i, isBaseClass, constructorName, serviceIdentifiers, constructorArgsMetadata);
        null !== target && targets.push(target);
    }
    return targets;
}

function _getServiceIdentifierForProperty(inject, multiInject, propertyName, className) {
    const serviceIdentifier = inject || multiInject;
    if (void 0 === serviceIdentifier) {
        const msg = `${ERROR_MSGS.MISSING_INJECTABLE_ANNOTATION} for property ${String(propertyName)} in class ${className}.`;
        throw new Error(msg);
    }
    return serviceIdentifier;
}

function getClassPropsAsTargets(metadataReader, constructorFunc, constructorName) {
    const classPropsMetadata = metadataReader.getPropertiesMetadata(constructorFunc);
    let targets = [];
    const symbolKeys = Object.getOwnPropertySymbols(classPropsMetadata), keys = Object.keys(classPropsMetadata).concat(symbolKeys);
    for (const key of keys) {
        const targetMetadata = classPropsMetadata[key], metadata = formatTargetMetadata(targetMetadata), identifier = metadata.targetName || key, serviceIdentifier = _getServiceIdentifierForProperty(metadata.inject, metadata.multiInject, key, constructorName), target = new Target(TargetTypeEnum.ClassProperty, identifier, serviceIdentifier);
        target.metadata = targetMetadata, targets.push(target);
    }
    const baseConstructor = Object.getPrototypeOf(constructorFunc.prototype).constructor;
    if (baseConstructor !== Object) {
        const baseTargets = getClassPropsAsTargets(metadataReader, baseConstructor, constructorName);
        targets = [ ...targets, ...baseTargets ];
    }
    return targets;
}

function getBaseClassDependencyCount(metadataReader, func) {
    const baseConstructor = Object.getPrototypeOf(func.prototype).constructor;
    if (baseConstructor !== Object) {
        const targets = getTargets(metadataReader, getFunctionName(baseConstructor), baseConstructor, !0), metadata = targets.map((t => t.metadata.filter((m => m.key === METADATA_KEY.UNMANAGED_TAG)))), unmanagedCount = [].concat.apply([], metadata).length, dependencyCount = targets.length - unmanagedCount;
        return dependencyCount > 0 ? dependencyCount : getBaseClassDependencyCount(metadataReader, baseConstructor);
    }
    return 0;
}

function formatTargetMetadata(targetMetadata) {
    const targetMetadataMap = {};
    return targetMetadata.forEach((m => {
        targetMetadataMap[m.key.toString()] = m.value;
    })), {
        inject: targetMetadataMap[METADATA_KEY.INJECT_TAG],
        multiInject: targetMetadataMap[METADATA_KEY.MULTI_INJECT_TAG],
        targetName: targetMetadataMap[METADATA_KEY.NAME_TAG],
        unmanaged: targetMetadataMap[METADATA_KEY.UNMANAGED_TAG]
    };
}

export { getDependencies, getBaseClassDependencyCount, getFunctionName };
//# sourceMappingURL=reflection_utils.js.map
