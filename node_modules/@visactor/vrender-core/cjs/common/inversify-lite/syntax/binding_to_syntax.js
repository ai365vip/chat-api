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
}), exports.BindingToSyntax = void 0;

const ERROR_MSGS = __importStar(require("../constants/error_msgs")), literal_types_1 = require("../constants/literal_types"), binding_in_when_on_syntax_1 = require("./binding_in_when_on_syntax"), binding_when_on_syntax_1 = require("./binding_when_on_syntax");

class BindingToSyntax {
    constructor(binding) {
        this._binding = binding;
    }
    to(constructor) {
        return this._binding.type = literal_types_1.BindingTypeEnum.Instance, this._binding.implementationType = constructor, 
        new binding_in_when_on_syntax_1.BindingInWhenOnSyntax(this._binding);
    }
    toSelf() {
        if ("function" != typeof this._binding.serviceIdentifier) throw new Error(`${ERROR_MSGS.INVALID_TO_SELF_VALUE}`);
        const self = this._binding.serviceIdentifier;
        return this.to(self);
    }
    toConstantValue(value) {
        return this._binding.type = literal_types_1.BindingTypeEnum.ConstantValue, this._binding.cache = value, 
        this._binding.dynamicValue = null, this._binding.implementationType = null, this._binding.scope = literal_types_1.BindingScopeEnum.Singleton, 
        new binding_when_on_syntax_1.BindingWhenOnSyntax(this._binding);
    }
    toDynamicValue(func) {
        return this._binding.type = literal_types_1.BindingTypeEnum.DynamicValue, this._binding.cache = null, 
        this._binding.dynamicValue = func, this._binding.implementationType = null, new binding_in_when_on_syntax_1.BindingInWhenOnSyntax(this._binding);
    }
    toConstructor(constructor) {
        return this._binding.type = literal_types_1.BindingTypeEnum.Constructor, this._binding.implementationType = constructor, 
        this._binding.scope = literal_types_1.BindingScopeEnum.Singleton, new binding_when_on_syntax_1.BindingWhenOnSyntax(this._binding);
    }
    toFactory(factory) {
        return this._binding.type = literal_types_1.BindingTypeEnum.Factory, this._binding.factory = factory, 
        this._binding.scope = literal_types_1.BindingScopeEnum.Singleton, new binding_when_on_syntax_1.BindingWhenOnSyntax(this._binding);
    }
    toFunction(func) {
        if ("function" != typeof func) throw new Error(ERROR_MSGS.INVALID_FUNCTION_BINDING);
        const bindingWhenOnSyntax = this.toConstantValue(func);
        return this._binding.type = literal_types_1.BindingTypeEnum.Function, this._binding.scope = literal_types_1.BindingScopeEnum.Singleton, 
        bindingWhenOnSyntax;
    }
    toAutoFactory(serviceIdentifier) {
        return this._binding.type = literal_types_1.BindingTypeEnum.Factory, this._binding.factory = context => () => context.container.get(serviceIdentifier), 
        this._binding.scope = literal_types_1.BindingScopeEnum.Singleton, new binding_when_on_syntax_1.BindingWhenOnSyntax(this._binding);
    }
    toAutoNamedFactory(serviceIdentifier) {
        return this._binding.type = literal_types_1.BindingTypeEnum.Factory, this._binding.factory = context => named => context.container.getNamed(serviceIdentifier, named), 
        new binding_when_on_syntax_1.BindingWhenOnSyntax(this._binding);
    }
    toProvider(provider) {
        return this._binding.type = literal_types_1.BindingTypeEnum.Provider, this._binding.provider = provider, 
        this._binding.scope = literal_types_1.BindingScopeEnum.Singleton, new binding_when_on_syntax_1.BindingWhenOnSyntax(this._binding);
    }
    toService(service) {
        this.toDynamicValue((context => context.container.get(service)));
    }
}

exports.BindingToSyntax = BindingToSyntax;
//# sourceMappingURL=binding_to_syntax.js.map
