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
}), exports.getBindingDictionary = exports.createMockRequest = exports.plan = void 0;

const binding_count_1 = require("../bindings/binding_count"), ERROR_MSGS = __importStar(require("../constants/error_msgs")), literal_types_1 = require("../constants/literal_types"), METADATA_KEY = __importStar(require("../constants/metadata_keys")), serialization_1 = require("../utils/serialization"), context_1 = require("./context"), metadata_1 = require("./metadata"), plan_1 = require("./plan"), reflection_utils_1 = require("./reflection_utils"), request_1 = require("./request"), target_1 = require("./target");

function getBindingDictionary(cntnr) {
    return cntnr._bindingDictionary;
}

function _createTarget(isMultiInject, targetType, serviceIdentifier, name, key, value) {
    const metadataKey = isMultiInject ? METADATA_KEY.MULTI_INJECT_TAG : METADATA_KEY.INJECT_TAG, injectMetadata = new metadata_1.Metadata(metadataKey, serviceIdentifier), target = new target_1.Target(targetType, name, serviceIdentifier, injectMetadata);
    if (void 0 !== key) {
        const tagMetadata = new metadata_1.Metadata(key, value);
        target.metadata.push(tagMetadata);
    }
    return target;
}

function _getActiveBindings(metadataReader, avoidConstraints, context, parentRequest, target) {
    let bindings = getBindings(context.container, target.serviceIdentifier), activeBindings = [];
    return bindings.length === binding_count_1.BindingCount.NoBindingsAvailable && context.container.options.autoBindInjectable && "function" == typeof target.serviceIdentifier && metadataReader.getConstructorMetadata(target.serviceIdentifier).compilerGeneratedMetadata && (context.container.bind(target.serviceIdentifier).toSelf(), 
    bindings = getBindings(context.container, target.serviceIdentifier)), activeBindings = avoidConstraints ? bindings : bindings.filter((binding => {
        const request = new request_1.Request(binding.serviceIdentifier, context, parentRequest, binding, target);
        return binding.constraint(request);
    })), _validateActiveBindingCount(target.serviceIdentifier, activeBindings, target, context.container), 
    activeBindings;
}

function _validateActiveBindingCount(serviceIdentifier, bindings, target, container) {
    switch (bindings.length) {
      case binding_count_1.BindingCount.NoBindingsAvailable:
        if (target.isOptional()) return bindings;
        const serviceIdentifierString = (0, serialization_1.getServiceIdentifierAsString)(serviceIdentifier);
        let msg = ERROR_MSGS.NOT_REGISTERED;
        throw msg += (0, serialization_1.listMetadataForTarget)(serviceIdentifierString, target), 
        msg += (0, serialization_1.listRegisteredBindingsForServiceIdentifier)(container, serviceIdentifierString, getBindings), 
        new Error(msg);

      case binding_count_1.BindingCount.OnlyOneBindingAvailable:
        return bindings;

      case binding_count_1.BindingCount.MultipleBindingsAvailable:
      default:
        if (target.isArray()) return bindings;
        {
            const serviceIdentifierString = (0, serialization_1.getServiceIdentifierAsString)(serviceIdentifier);
            let msg = `${ERROR_MSGS.AMBIGUOUS_MATCH} ${serviceIdentifierString}`;
            throw msg += (0, serialization_1.listRegisteredBindingsForServiceIdentifier)(container, serviceIdentifierString, getBindings), 
            new Error(msg);
        }
    }
}

function _createSubRequests(metadataReader, avoidConstraints, serviceIdentifier, context, parentRequest, target) {
    let activeBindings, childRequest;
    if (null === parentRequest) {
        activeBindings = _getActiveBindings(metadataReader, avoidConstraints, context, null, target), 
        childRequest = new request_1.Request(serviceIdentifier, context, null, activeBindings, target);
        const thePlan = new plan_1.Plan(context, childRequest);
        context.addPlan(thePlan);
    } else activeBindings = _getActiveBindings(metadataReader, avoidConstraints, context, parentRequest, target), 
    childRequest = parentRequest.addChildRequest(target.serviceIdentifier, activeBindings, target);
    activeBindings.forEach((binding => {
        let subChildRequest = null;
        if (target.isArray()) subChildRequest = childRequest.addChildRequest(binding.serviceIdentifier, binding, target); else {
            if (binding.cache) return;
            subChildRequest = childRequest;
        }
        if (binding.type === literal_types_1.BindingTypeEnum.Instance && null !== binding.implementationType) {
            const dependencies = (0, reflection_utils_1.getDependencies)(metadataReader, binding.implementationType);
            if (!context.container.options.skipBaseClassChecks) {
                const baseClassDependencyCount = (0, reflection_utils_1.getBaseClassDependencyCount)(metadataReader, binding.implementationType);
                if (dependencies.length < baseClassDependencyCount) {
                    const error = ERROR_MSGS.ARGUMENTS_LENGTH_MISMATCH((0, reflection_utils_1.getFunctionName)(binding.implementationType));
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
    const context = new context_1.Context(container);
    return _createSubRequests(metadataReader, avoidConstraints, serviceIdentifier, context, null, _createTarget(isMultiInject, targetType, serviceIdentifier, "", key, value)), 
    context;
}

function createMockRequest(container, serviceIdentifier, key, value) {
    const target = new target_1.Target(literal_types_1.TargetTypeEnum.Variable, "", serviceIdentifier, new metadata_1.Metadata(key, value)), context = new context_1.Context(container);
    return new request_1.Request(serviceIdentifier, context, null, [], target);
}

exports.getBindingDictionary = getBindingDictionary, exports.plan = plan, exports.createMockRequest = createMockRequest;
//# sourceMappingURL=planner.js.map
