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
};

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.getFunctionName = exports.getBaseClassDependencyCount = exports.getDependencies = void 0;

const lazy_service_identifier_1 = require("../annotation/lazy_service_identifier"), ERROR_MSGS = __importStar(require("../constants/error_msgs")), literal_types_1 = require("../constants/literal_types"), METADATA_KEY = __importStar(require("../constants/metadata_keys")), serialization_1 = require("../utils/serialization");

Object.defineProperty(exports, "getFunctionName", {
    enumerable: !0,
    get: function() {
        return serialization_1.getFunctionName;
    }
});

const target_1 = require("./target");

function getDependencies(metadataReader, func) {
    return getTargets(metadataReader, (0, serialization_1.getFunctionName)(func), func, !1);
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
    if (serviceIdentifier = injectIdentifier || serviceIdentifier, serviceIdentifier instanceof lazy_service_identifier_1.LazyServiceIdentifer && (serviceIdentifier = serviceIdentifier.unwrap()), 
    isManaged) {
        if (!isBaseClass && (serviceIdentifier === Object || serviceIdentifier === Function || void 0 === serviceIdentifier)) {
            const msg = `${ERROR_MSGS.MISSING_INJECT_ANNOTATION} argument ${index} in class ${constructorName}.`;
            throw new Error(msg);
        }
        const target = new target_1.Target(literal_types_1.TargetTypeEnum.ConstructorArgument, metadata.targetName, serviceIdentifier);
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
        const targetMetadata = classPropsMetadata[key], metadata = formatTargetMetadata(targetMetadata), identifier = metadata.targetName || key, serviceIdentifier = _getServiceIdentifierForProperty(metadata.inject, metadata.multiInject, key, constructorName), target = new target_1.Target(literal_types_1.TargetTypeEnum.ClassProperty, identifier, serviceIdentifier);
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
        const targets = getTargets(metadataReader, (0, serialization_1.getFunctionName)(baseConstructor), baseConstructor, !0), metadata = targets.map((t => t.metadata.filter((m => m.key === METADATA_KEY.UNMANAGED_TAG)))), unmanagedCount = [].concat.apply([], metadata).length, dependencyCount = targets.length - unmanagedCount;
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

exports.getDependencies = getDependencies, exports.getBaseClassDependencyCount = getBaseClassDependencyCount;
//# sourceMappingURL=reflection_utils.js.map
