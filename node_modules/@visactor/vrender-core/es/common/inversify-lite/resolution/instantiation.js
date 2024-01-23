var __awaiter = this && this.__awaiter || function(thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))((function(resolve, reject) {
        function fulfilled(value) {
            try {
                step(generator.next(value));
            } catch (e) {
                reject(e);
            }
        }
        function rejected(value) {
            try {
                step(generator.throw(value));
            } catch (e) {
                reject(e);
            }
        }
        function step(result) {
            var value;
            result.done ? resolve(result.value) : (value = result.value, value instanceof P ? value : new P((function(resolve) {
                resolve(value);
            }))).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    }));
};

import { ON_DEACTIVATION_ERROR, PRE_DESTROY_ERROR } from "../constants/error_msgs";

import { BindingScopeEnum, TargetTypeEnum } from "../constants/literal_types";

import * as METADATA_KEY from "../constants/metadata_keys";

import { isPromise, isPromiseOrContainsPromise } from "../utils/async";

import Reflect from "../../Reflect-metadata";

function _resolveRequests(childRequests, resolveRequest) {
    return childRequests.reduce(((resolvedRequests, childRequest) => {
        const injection = resolveRequest(childRequest);
        return childRequest.target.type === TargetTypeEnum.ConstructorArgument ? resolvedRequests.constructorInjections.push(injection) : (resolvedRequests.propertyRequests.push(childRequest), 
        resolvedRequests.propertyInjections.push(injection)), resolvedRequests.isAsync || (resolvedRequests.isAsync = isPromiseOrContainsPromise(injection)), 
        resolvedRequests;
    }), {
        constructorInjections: [],
        propertyInjections: [],
        propertyRequests: [],
        isAsync: !1
    });
}

function _createInstance(constr, childRequests, resolveRequest) {
    let result;
    if (childRequests.length > 0) {
        const resolved = _resolveRequests(childRequests, resolveRequest), createInstanceWithInjectionsArg = Object.assign(Object.assign({}, resolved), {
            constr: constr
        });
        result = resolved.isAsync ? createInstanceWithInjectionsAsync(createInstanceWithInjectionsArg) : createInstanceWithInjections(createInstanceWithInjectionsArg);
    } else result = new constr;
    return result;
}

function createInstanceWithInjections(args) {
    const instance = new args.constr(...args.constructorInjections);
    return args.propertyRequests.forEach(((r, index) => {
        const property = r.target.identifier, injection = args.propertyInjections[index];
        instance[property] = injection;
    })), instance;
}

function createInstanceWithInjectionsAsync(args) {
    return __awaiter(this, void 0, void 0, (function*() {
        const constructorInjections = yield possiblyWaitInjections(args.constructorInjections), propertyInjections = yield possiblyWaitInjections(args.propertyInjections);
        return createInstanceWithInjections(Object.assign(Object.assign({}, args), {
            constructorInjections: constructorInjections,
            propertyInjections: propertyInjections
        }));
    }));
}

function possiblyWaitInjections(possiblePromiseinjections) {
    return __awaiter(this, void 0, void 0, (function*() {
        const injections = [];
        for (const injection of possiblePromiseinjections) Array.isArray(injection) ? injections.push(Promise.all(injection)) : injections.push(injection);
        return Promise.all(injections);
    }));
}

function _getInstanceAfterPostConstruct(constr, result) {
    const postConstructResult = _postConstruct(constr, result);
    return isPromise(postConstructResult) ? postConstructResult.then((() => result)) : result;
}

function _postConstruct(constr, instance) {
    var _a, _b;
    if (Reflect.hasMetadata(METADATA_KEY.POST_CONSTRUCT, constr)) {
        return null === (_b = (_a = instance)[Reflect.getMetadata(METADATA_KEY.POST_CONSTRUCT, constr).value]) || void 0 === _b ? void 0 : _b.call(_a);
    }
}

function _validateInstanceResolution(binding, constr) {
    binding.scope !== BindingScopeEnum.Singleton && _throwIfHandlingDeactivation(binding, constr);
}

function _throwIfHandlingDeactivation(binding, constr) {
    const scopeErrorMessage = `Class cannot be instantiated in ${binding.scope === BindingScopeEnum.Request ? "request" : "transient"} scope.`;
    if ("function" == typeof binding.onDeactivation) throw new Error(ON_DEACTIVATION_ERROR(constr.name, scopeErrorMessage));
    if (Reflect.hasMetadata(METADATA_KEY.PRE_DESTROY, constr)) throw new Error(PRE_DESTROY_ERROR(constr.name, scopeErrorMessage));
}

function resolveInstance(binding, constr, childRequests, resolveRequest) {
    _validateInstanceResolution(binding, constr);
    const result = _createInstance(constr, childRequests, resolveRequest);
    return isPromise(result) ? result.then((resolvedResult => _getInstanceAfterPostConstruct(constr, resolvedResult))) : _getInstanceAfterPostConstruct(constr, result);
}

export { resolveInstance };
//# sourceMappingURL=instantiation.js.map
