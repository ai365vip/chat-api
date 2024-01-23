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
}, __awaiter = this && this.__awaiter || function(thisArg, _arguments, P, generator) {
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
}, __importDefault = this && this.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : {
        default: mod
    };
};

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.resolveInstance = void 0;

const error_msgs_1 = require("../constants/error_msgs"), literal_types_1 = require("../constants/literal_types"), METADATA_KEY = __importStar(require("../constants/metadata_keys")), async_1 = require("../utils/async"), Reflect_metadata_1 = __importDefault(require("../../Reflect-metadata"));

function _resolveRequests(childRequests, resolveRequest) {
    return childRequests.reduce(((resolvedRequests, childRequest) => {
        const injection = resolveRequest(childRequest);
        return childRequest.target.type === literal_types_1.TargetTypeEnum.ConstructorArgument ? resolvedRequests.constructorInjections.push(injection) : (resolvedRequests.propertyRequests.push(childRequest), 
        resolvedRequests.propertyInjections.push(injection)), resolvedRequests.isAsync || (resolvedRequests.isAsync = (0, 
        async_1.isPromiseOrContainsPromise)(injection)), resolvedRequests;
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
    return (0, async_1.isPromise)(postConstructResult) ? postConstructResult.then((() => result)) : result;
}

function _postConstruct(constr, instance) {
    var _a, _b;
    if (Reflect_metadata_1.default.hasMetadata(METADATA_KEY.POST_CONSTRUCT, constr)) {
        return null === (_b = (_a = instance)[Reflect_metadata_1.default.getMetadata(METADATA_KEY.POST_CONSTRUCT, constr).value]) || void 0 === _b ? void 0 : _b.call(_a);
    }
}

function _validateInstanceResolution(binding, constr) {
    binding.scope !== literal_types_1.BindingScopeEnum.Singleton && _throwIfHandlingDeactivation(binding, constr);
}

function _throwIfHandlingDeactivation(binding, constr) {
    const scopeErrorMessage = `Class cannot be instantiated in ${binding.scope === literal_types_1.BindingScopeEnum.Request ? "request" : "transient"} scope.`;
    if ("function" == typeof binding.onDeactivation) throw new Error((0, error_msgs_1.ON_DEACTIVATION_ERROR)(constr.name, scopeErrorMessage));
    if (Reflect_metadata_1.default.hasMetadata(METADATA_KEY.PRE_DESTROY, constr)) throw new Error((0, 
    error_msgs_1.PRE_DESTROY_ERROR)(constr.name, scopeErrorMessage));
}

function resolveInstance(binding, constr, childRequests, resolveRequest) {
    _validateInstanceResolution(binding, constr);
    const result = _createInstance(constr, childRequests, resolveRequest);
    return (0, async_1.isPromise)(result) ? result.then((resolvedResult => _getInstanceAfterPostConstruct(constr, resolvedResult))) : _getInstanceAfterPostConstruct(constr, result);
}

exports.resolveInstance = resolveInstance;
//# sourceMappingURL=instantiation.js.map
