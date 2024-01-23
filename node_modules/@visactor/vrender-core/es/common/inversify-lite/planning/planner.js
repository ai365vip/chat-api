import { BindingCount } from "../bindings/binding_count";

import * as ERROR_MSGS from "../constants/error_msgs";

import { BindingTypeEnum, TargetTypeEnum } from "../constants/literal_types";

import * as METADATA_KEY from "../constants/metadata_keys";

import { getServiceIdentifierAsString, listMetadataForTarget, listRegisteredBindingsForServiceIdentifier } from "../utils/serialization";

import { Context } from "./context";

import { Metadata } from "./metadata";

import { Plan } from "./plan";

import { getBaseClassDependencyCount, getDependencies, getFunctionName } from "./reflection_utils";

import { Request } from "./request";

import { Target } from "./target";

function getBindingDictionary(cntnr) {
    return cntnr._bindingDictionary;
}

function _createTarget(isMultiInject, targetType, serviceIdentifier, name, key, value) {
    const metadataKey = isMultiInject ? METADATA_KEY.MULTI_INJECT_TAG : METADATA_KEY.INJECT_TAG, injectMetadata = new Metadata(metadataKey, serviceIdentifier), target = new Target(targetType, name, serviceIdentifier, injectMetadata);
    if (void 0 !== key) {
        const tagMetadata = new Metadata(key, value);
        target.metadata.push(tagMetadata);
    }
    return target;
}

function _getActiveBindings(metadataReader, avoidConstraints, context, parentRequest, target) {
    let bindings = getBindings(context.container, target.serviceIdentifier), activeBindings = [];
    return bindings.length === BindingCount.NoBindingsAvailable && context.container.options.autoBindInjectable && "function" == typeof target.serviceIdentifier && metadataReader.getConstructorMetadata(target.serviceIdentifier).compilerGeneratedMetadata && (context.container.bind(target.serviceIdentifier).toSelf(), 
    bindings = getBindings(context.container, target.serviceIdentifier)), activeBindings = avoidConstraints ? bindings : bindings.filter((binding => {
        const request = new Request(binding.serviceIdentifier, context, parentRequest, binding, target);
        return binding.constraint(request);
    })), _validateActiveBindingCount(target.serviceIdentifier, activeBindings, target, context.container), 
    activeBindings;
}

function _validateActiveBindingCount(serviceIdentifier, bindings, target, container) {
    switch (bindings.length) {
      case BindingCount.NoBindingsAvailable:
        if (target.isOptional()) return bindings;
        const serviceIdentifierString = getServiceIdentifierAsString(serviceIdentifier);
        let msg = ERROR_MSGS.NOT_REGISTERED;
        throw msg += listMetadataForTarget(serviceIdentifierString, target), msg += listRegisteredBindingsForServiceIdentifier(container, serviceIdentifierString, getBindings), 
        new Error(msg);

      case BindingCount.OnlyOneBindingAvailable:
        return bindings;

      case BindingCount.MultipleBindingsAvailable:
      default:
        if (target.isArray()) return bindings;
        {
            const serviceIdentifierString = getServiceIdentifierAsString(serviceIdentifier);
            let msg = `${ERROR_MSGS.AMBIGUOUS_MATCH} ${serviceIdentifierString}`;
            throw msg += listRegisteredBindingsForServiceIdentifier(container, serviceIdentifierString, getBindings), 
            new Error(msg);
        }
    }
}

function _createSubRequests(metadataReader, avoidConstraints, serviceIdentifier, context, parentRequest, target) {
    let activeBindings, childRequest;
    if (null === parentRequest) {
        activeBindings = _getActiveBindings(metadataReader, avoidConstraints, context, null, target), 
        childRequest = new Request(serviceIdentifier, context, null, activeBindings, target);
        const thePlan = new Plan(context, childRequest);
        context.addPlan(thePlan);
    } else activeBindings = _getActiveBindings(metadataReader, avoidConstraints, context, parentRequest, target), 
    childRequest = parentRequest.addChildRequest(target.serviceIdentifier, activeBindings, target);
    activeBindings.forEach((binding => {
        let subChildRequest = null;
        if (target.isArray()) subChildRequest = childRequest.addChildRequest(binding.serviceIdentifier, binding, target); else {
            if (binding.cache) return;
            subChildRequest = childRequest;
        }
        if (binding.type === BindingTypeEnum.Instance && null !== binding.implementationType) {
            const dependencies = getDependencies(metadataReader, binding.implementationType);
            if (!context.container.options.skipBaseClassChecks) {
                const baseClassDependencyCount = getBaseClassDependencyCount(metadataReader, binding.implementationType);
                if (dependencies.length < baseClassDependencyCount) {
                    const error = ERROR_MSGS.ARGUMENTS_LENGTH_MISMATCH(getFunctionName(binding.implementationType));
                    throw new Error(error);
                }
            }
            dependencies.forEach((dependency => {
                _createSubRequests(metadataReader, !1, dependency.serviceIdentifier, context, subChildRequest, dependency);
            }));
        }
    }));
}

function getBindings(container, serviceIdentifier) {
    let bindings = [];
    const bindingDictionary = getBindingDictionary(container);
    return bindingDictionary.hasKey(serviceIdentifier) ? bindings = bindingDictionary.get(serviceIdentifier) : null !== container.parent && (bindings = getBindings(container.parent, serviceIdentifier)), 
    bindings;
}

function plan(metadataReader, container, isMultiInject, targetType, serviceIdentifier, key, value, avoidConstraints = !1) {
    const context = new Context(container);
    return _createSubRequests(metadataReader, avoidConstraints, serviceIdentifier, context, null, _createTarget(isMultiInject, targetType, serviceIdentifier, "", key, value)), 
    context;
}

function createMockRequest(container, serviceIdentifier, key, value) {
    const target = new Target(TargetTypeEnum.Variable, "", serviceIdentifier, new Metadata(key, value)), context = new Context(container);
    return new Request(serviceIdentifier, context, null, [], target);
}

export { plan, createMockRequest, getBindingDictionary };
//# sourceMappingURL=planner.js.map
