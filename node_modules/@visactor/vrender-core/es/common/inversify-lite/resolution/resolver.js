import * as ERROR_MSGS from "../constants/error_msgs";

import { BindingTypeEnum } from "../constants/literal_types";

import { saveToScope, tryGetFromScope } from "../scope/scope";

import { getFactoryDetails, ensureFullyBound } from "../utils/binding_utils";

import { tryAndThrowErrorIfStackOverflow } from "../utils/exceptions";

import { resolveInstance } from "./instantiation";

const _resolveRequest = requestScope => request => {
    request.parentContext.setCurrentRequest(request);
    const bindings = request.bindings, childRequests = request.childRequests, targetIsAnArray = request.target && request.target.isArray(), targetParentIsNotAnArray = !(request.parentRequest && request.parentRequest.target && request.target && request.parentRequest.target.matchesArray(request.target.serviceIdentifier));
    if (targetIsAnArray && targetParentIsNotAnArray) return childRequests.map((childRequest => _resolveRequest(requestScope)(childRequest)));
    if (request.target.isOptional() && 0 === bindings.length) return;
    const binding = bindings[0];
    return _resolveBinding(requestScope, request, binding);
}, _resolveFactoryFromBinding = (binding, context) => {
    const factoryDetails = getFactoryDetails(binding);
    return tryAndThrowErrorIfStackOverflow((() => factoryDetails.factory.bind(binding)(context)), (() => new Error(ERROR_MSGS.CIRCULAR_DEPENDENCY_IN_FACTORY(factoryDetails.factoryType, context.currentRequest.serviceIdentifier.toString()))));
}, _getResolvedFromBinding = (requestScope, request, binding) => {
    let result;
    const childRequests = request.childRequests;
    switch (ensureFullyBound(binding), binding.type) {
      case BindingTypeEnum.ConstantValue:
      case BindingTypeEnum.Function:
        result = binding.cache;
        break;

      case BindingTypeEnum.Constructor:
        result = binding.implementationType;
        break;

      case BindingTypeEnum.Instance:
        result = resolveInstance(binding, binding.implementationType, childRequests, _resolveRequest(requestScope));
        break;

      default:
        result = _resolveFactoryFromBinding(binding, request.parentContext);
    }
    return result;
}, _resolveInScope = (requestScope, binding, resolveFromBinding) => {
    let result = tryGetFromScope(requestScope, binding);
    return null !== result || (result = resolveFromBinding(), saveToScope(requestScope, binding, result)), 
    result;
}, _resolveBinding = (requestScope, request, binding) => _resolveInScope(requestScope, binding, (() => _getResolvedFromBinding(requestScope, request, binding)));

function resolve(context) {
    return _resolveRequest(context.plan.rootRequest.requestScope)(context.plan.rootRequest);
}

export { resolve };
//# sourceMappingURL=resolver.js.map
