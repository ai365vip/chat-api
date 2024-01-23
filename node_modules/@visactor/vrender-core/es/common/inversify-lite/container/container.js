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

import { Binding } from "../bindings/binding";

import * as ERROR_MSGS from "../constants/error_msgs";

import { BindingScopeEnum, TargetTypeEnum } from "../constants/literal_types";

import * as METADATA_KEY from "../constants/metadata_keys";

import { MetadataReader } from "../planning/metadata_reader";

import { createMockRequest, getBindingDictionary, plan } from "../planning/planner";

import { resolve } from "../resolution/resolver";

import { BindingToSyntax } from "../syntax/binding_to_syntax";

import { isPromise } from "../utils/async";

import { id } from "../utils/id";

import { getServiceIdentifierAsString } from "../utils/serialization";

import { Lookup } from "./lookup";

import Reflect from "../../Reflect-metadata";

class Container {
    static merge(container1, container2, ...containers) {
        const container = new Container, targetContainers = [ container1, container2, ...containers ].map((targetContainer => getBindingDictionary(targetContainer))), bindingDictionary = getBindingDictionary(container);
        return targetContainers.forEach((targetBindingDictionary => {
            var destination;
            destination = bindingDictionary, targetBindingDictionary.traverse(((_key, value) => {
                value.forEach((binding => {
                    destination.add(binding.serviceIdentifier, binding.clone());
                }));
            }));
        })), container;
    }
    constructor(containerOptions) {
        const options = containerOptions || {};
        if ("object" != typeof options) throw new Error(`${ERROR_MSGS.CONTAINER_OPTIONS_MUST_BE_AN_OBJECT}`);
        if (void 0 === options.defaultScope) options.defaultScope = BindingScopeEnum.Transient; else if (options.defaultScope !== BindingScopeEnum.Singleton && options.defaultScope !== BindingScopeEnum.Transient && options.defaultScope !== BindingScopeEnum.Request) throw new Error(`${ERROR_MSGS.CONTAINER_OPTIONS_INVALID_DEFAULT_SCOPE}`);
        if (void 0 === options.autoBindInjectable) options.autoBindInjectable = !1; else if ("boolean" != typeof options.autoBindInjectable) throw new Error(`${ERROR_MSGS.CONTAINER_OPTIONS_INVALID_AUTO_BIND_INJECTABLE}`);
        if (void 0 === options.skipBaseClassChecks) options.skipBaseClassChecks = !1; else if ("boolean" != typeof options.skipBaseClassChecks) throw new Error(`${ERROR_MSGS.CONTAINER_OPTIONS_INVALID_SKIP_BASE_CHECK}`);
        this.options = {
            autoBindInjectable: options.autoBindInjectable,
            defaultScope: options.defaultScope,
            skipBaseClassChecks: options.skipBaseClassChecks
        }, this.id = id(), this._bindingDictionary = new Lookup, this.parent = null, this._metadataReader = new MetadataReader;
    }
    load(...modules) {
        const getHelpers = this._getContainerModuleHelpersFactory();
        for (const currentModule of modules) {
            const containerModuleHelpers = getHelpers(currentModule.id);
            currentModule.registry(containerModuleHelpers.bindFunction, containerModuleHelpers.unbindFunction, containerModuleHelpers.isboundFunction, containerModuleHelpers.rebindFunction);
        }
    }
    unload(...modules) {
        modules.forEach((module => {
            const deactivations = this._removeModuleBindings(module.id);
            this._deactivateSingletons(deactivations);
        }));
    }
    bind(serviceIdentifier) {
        const scope = this.options.defaultScope || BindingScopeEnum.Transient, binding = new Binding(serviceIdentifier, scope);
        return this._bindingDictionary.add(serviceIdentifier, binding), new BindingToSyntax(binding);
    }
    rebind(serviceIdentifier) {
        return this.unbind(serviceIdentifier), this.bind(serviceIdentifier);
    }
    unbind(serviceIdentifier) {
        if (this._bindingDictionary.hasKey(serviceIdentifier)) {
            const bindings = this._bindingDictionary.get(serviceIdentifier);
            this._deactivateSingletons(bindings);
        }
        this._removeServiceFromDictionary(serviceIdentifier);
    }
    unbindAll() {
        this._bindingDictionary.traverse(((_key, value) => {
            this._deactivateSingletons(value);
        })), this._bindingDictionary = new Lookup;
    }
    isBound(serviceIdentifier) {
        let bound = this._bindingDictionary.hasKey(serviceIdentifier);
        return !bound && this.parent && (bound = this.parent.isBound(serviceIdentifier)), 
        bound;
    }
    isCurrentBound(serviceIdentifier) {
        return this._bindingDictionary.hasKey(serviceIdentifier);
    }
    isBoundNamed(serviceIdentifier, named) {
        return this.isBoundTagged(serviceIdentifier, METADATA_KEY.NAMED_TAG, named);
    }
    isBoundTagged(serviceIdentifier, key, value) {
        let bound = !1;
        if (this._bindingDictionary.hasKey(serviceIdentifier)) {
            const bindings = this._bindingDictionary.get(serviceIdentifier), request = createMockRequest(this, serviceIdentifier, key, value);
            bound = bindings.some((b => b.constraint(request)));
        }
        return !bound && this.parent && (bound = this.parent.isBoundTagged(serviceIdentifier, key, value)), 
        bound;
    }
    applyCustomMetadataReader(metadataReader) {
        this._metadataReader = metadataReader;
    }
    get(serviceIdentifier) {
        const getArgs = this._getNotAllArgs(serviceIdentifier, !1);
        return this._getButThrowIfAsync(getArgs);
    }
    getAsync(serviceIdentifier) {
        return __awaiter(this, void 0, void 0, (function*() {
            const getArgs = this._getNotAllArgs(serviceIdentifier, !1);
            return this._get(getArgs);
        }));
    }
    getTagged(serviceIdentifier, key, value) {
        const getArgs = this._getNotAllArgs(serviceIdentifier, !1, key, value);
        return this._getButThrowIfAsync(getArgs);
    }
    getNamed(serviceIdentifier, named) {
        return this.getTagged(serviceIdentifier, METADATA_KEY.NAMED_TAG, named);
    }
    getAll(serviceIdentifier) {
        const getArgs = this._getAllArgs(serviceIdentifier);
        return this._getButThrowIfAsync(getArgs);
    }
    getAllTagged(serviceIdentifier, key, value) {
        const getArgs = this._getNotAllArgs(serviceIdentifier, !0, key, value);
        return this._getButThrowIfAsync(getArgs);
    }
    getAllNamed(serviceIdentifier, named) {
        return this.getAllTagged(serviceIdentifier, METADATA_KEY.NAMED_TAG, named);
    }
    resolve(constructorFunction) {
        const isBound = this.isBound(constructorFunction);
        isBound || this.bind(constructorFunction).toSelf();
        const resolved = this.get(constructorFunction);
        return isBound || this.unbind(constructorFunction), resolved;
    }
    _preDestroy(constructor, instance) {
        var _a, _b;
        if (Reflect.hasMetadata(METADATA_KEY.PRE_DESTROY, constructor)) {
            return null === (_b = (_a = instance)[Reflect.getMetadata(METADATA_KEY.PRE_DESTROY, constructor).value]) || void 0 === _b ? void 0 : _b.call(_a);
        }
    }
    _removeModuleBindings(moduleId) {
        return this._bindingDictionary.removeByCondition((binding => binding.moduleId === moduleId));
    }
    _deactivate(binding, instance) {
        const constructor = Object.getPrototypeOf(instance).constructor;
        try {
            const propagateDeactivationResult = this._propagateContainerDeactivationThenBindingAndPreDestroy(binding, instance, constructor);
            if (isPromise(propagateDeactivationResult)) return this._handleDeactivationError(propagateDeactivationResult, constructor);
        } catch (ex) {
            if (ex instanceof Error) throw new Error(ERROR_MSGS.ON_DEACTIVATION_ERROR(constructor.name, ex.message));
        }
    }
    _handleDeactivationError(asyncResult, constructor) {
        return __awaiter(this, void 0, void 0, (function*() {
            try {
                yield asyncResult;
            } catch (ex) {
                if (ex instanceof Error) throw new Error(ERROR_MSGS.ON_DEACTIVATION_ERROR(constructor.name, ex.message));
            }
        }));
    }
    _getContainerModuleHelpersFactory() {
        const setModuleId = (bindingToSyntax, moduleId) => {
            bindingToSyntax._binding.moduleId = moduleId;
        }, getBindFunction = moduleId => serviceIdentifier => {
            const bindingToSyntax = this.bind(serviceIdentifier);
            return setModuleId(bindingToSyntax, moduleId), bindingToSyntax;
        }, getUnbindFunction = () => serviceIdentifier => this.unbind(serviceIdentifier), getIsboundFunction = () => serviceIdentifier => this.isBound(serviceIdentifier), getRebindFunction = moduleId => serviceIdentifier => {
            const bindingToSyntax = this.rebind(serviceIdentifier);
            return setModuleId(bindingToSyntax, moduleId), bindingToSyntax;
        };
        return mId => ({
            bindFunction: getBindFunction(mId),
            isboundFunction: getIsboundFunction(),
            rebindFunction: getRebindFunction(mId),
            unbindFunction: getUnbindFunction(),
            unbindAsyncFunction: serviceIdentifier => null
        });
    }
    _get(getArgs) {
        const planAndResolveArgs = Object.assign(Object.assign({}, getArgs), {
            contextInterceptor: context => context,
            targetType: TargetTypeEnum.Variable
        });
        return this._planAndResolve()(planAndResolveArgs);
    }
    _getButThrowIfAsync(getArgs) {
        return this._get(getArgs);
    }
    _getAllArgs(serviceIdentifier) {
        return {
            avoidConstraints: !0,
            isMultiInject: !0,
            serviceIdentifier: serviceIdentifier
        };
    }
    _getNotAllArgs(serviceIdentifier, isMultiInject, key, value) {
        return {
            avoidConstraints: !1,
            isMultiInject: isMultiInject,
            serviceIdentifier: serviceIdentifier,
            key: key,
            value: value
        };
    }
    _planAndResolve() {
        return args => {
            let context = plan(this._metadataReader, this, args.isMultiInject, args.targetType, args.serviceIdentifier, args.key, args.value, args.avoidConstraints);
            context = args.contextInterceptor(context);
            return resolve(context);
        };
    }
    _deactivateIfSingleton(binding) {
        if (binding.activated) return isPromise(binding.cache) ? binding.cache.then((resolved => this._deactivate(binding, resolved))) : this._deactivate(binding, binding.cache);
    }
    _deactivateSingletons(bindings) {
        for (const binding of bindings) {
            const result = this._deactivateIfSingleton(binding);
            if (isPromise(result)) throw new Error(ERROR_MSGS.ASYNC_UNBIND_REQUIRED);
        }
    }
    _propagateContainerDeactivationThenBindingAndPreDestroy(binding, instance, constructor) {
        return this.parent ? this._deactivate.bind(this.parent)(binding, instance) : this._bindingDeactivationAndPreDestroy(binding, instance, constructor);
    }
    _removeServiceFromDictionary(serviceIdentifier) {
        try {
            this._bindingDictionary.remove(serviceIdentifier);
        } catch (e) {
            throw new Error(`${ERROR_MSGS.CANNOT_UNBIND} ${getServiceIdentifierAsString(serviceIdentifier)}`);
        }
    }
    _bindingDeactivationAndPreDestroy(binding, instance, constructor) {
        if ("function" == typeof binding.onDeactivation) {
            const result = binding.onDeactivation(instance);
            if (isPromise(result)) return result.then((() => this._preDestroy(constructor, instance)));
        }
        return this._preDestroy(constructor, instance);
    }
    _bindingDeactivationAndPreDestroyAsync(binding, instance, constructor) {
        return __awaiter(this, void 0, void 0, (function*() {
            "function" == typeof binding.onDeactivation && (yield binding.onDeactivation(instance)), 
            yield this._preDestroy(constructor, instance);
        }));
    }
}

export { Container };
//# sourceMappingURL=container.js.map
