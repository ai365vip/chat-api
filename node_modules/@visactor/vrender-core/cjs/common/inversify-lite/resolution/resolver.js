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
}), exports.resolve = void 0;

const ERROR_MSGS = __importStar(require("../constants/error_msgs")), literal_types_1 = require("../constants/literal_types"), scope_1 = require("../scope/scope"), binding_utils_1 = require("../utils/binding_utils"), exceptions_1 = require("../utils/exceptions"), instantiation_1 = require("./instantiation"), _resolveRequest = requestScope => request => {
    request.parentContext.setCurrentRequest(request);
    const bindings = request.bindings, childRequests = request.childRequests, targetIsAnArray = request.target && request.target.isArray(), targetParentIsNotAnArray = !(request.parentRequest && request.parentRequest.target && request.target && request.parentRequest.target.matchesArray(request.target.serviceIdentifier));
    if (targetIsAnArray && targetParentIsNotAnArray) return childRequests.map((childRequest => _resolveRequest(requestScope)(childRequest)));
    if (request.target.isOptional() && 0 === bindings.length) return;
    const binding = bindings[0];
    return _resolveBinding(requestScope, request, binding);
}, _resolveFactoryFromBinding = (binding, context) => {
    const factoryDetails = (0, binding_utils_1.getFactoryDetails)(binding);
    return (0, exceptions_1.tryAndThrowErrorIfStackOverflow)((() => factoryDetails.factory.bind(binding)(context)), (() => new Error(ERROR_MSGS.CIRCULAR_DEPENDENCY_IN_FACTORY(factoryDetails.factoryType, context.currentRequest.serviceIdentifier.toString()))));
}, _getResolvedFromBinding = (requestScope, request, binding) => {
    let result;
    const childRequests = request.childRequests;
    switch ((0, binding_utils_1.ensureFullyBound)(binding), binding.type) {
      case literal_types_1.BindingTypeEnum.ConstantValue:
      case literal_types_1.BindingTypeEnum.Function:
        result = binding.cache;
        break;

      case literal_types_1.BindingTypeEnum.Constructor:
        result = binding.implementationType;
        break;

      case literal_types_1.BindingTypeEnum.Instance:
        result = (0, instantiation_1.resolveInstance)(binding, binding.implementationType, childRequests, _resolveRequest(requestScope));
        break;

      default:
        result = _resolveFactoryFromBinding(binding, request.parentContext);
    }
    return result;
}, _resolveInScope = (requestScope, binding, resolveFromBinding) => {
    let result = (0, scope_1.tryGetFromScope)(requestScope, binding);
    return null !== result || (result = resolveFromBinding(), (0, scope_1.saveToScope)(requestScope, binding, result)), 
    result;
}, _resolveBinding = (requestScope, request, binding) => _resolveInScope(requestScope, binding, (() => _getResolvedFromBinding(requestScope, request, binding)));

function resolve(context) {
    return _resolveRequest(context.plan.rootRequest.requestScope)(context.plan.rootRequest);
}

exports.resolve = resolve;
//# sourceMappingURL=resolver.js.map
