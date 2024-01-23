"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.Binding = void 0;

const literal_types_1 = require("../constants/literal_types"), id_1 = require("../utils/id");

class Binding {
    constructor(serviceIdentifier, scope) {
        this.id = (0, id_1.id)(), this.activated = !1, this.serviceIdentifier = serviceIdentifier, 
        this.scope = scope, this.type = literal_types_1.BindingTypeEnum.Invalid, this.constraint = request => !0, 
        this.implementationType = null, this.cache = null, this.factory = null, this.provider = null, 
        this.onActivation = null, this.onDeactivation = null, this.dynamicValue = null;
    }
    clone() {
        const clone = new Binding(this.serviceIdentifier, this.scope);
        return clone.activated = clone.scope === literal_types_1.BindingScopeEnum.Singleton && this.activated, 
        clone.implementationType = this.implementationType, clone.dynamicValue = this.dynamicValue, 
        clone.scope = this.scope, clone.type = this.type, clone.factory = this.factory, 
        clone.provider = this.provider, clone.constraint = this.constraint, clone.onActivation = this.onActivation, 
        clone.onDeactivation = this.onDeactivation, clone.cache = this.cache, clone;
    }
}

exports.Binding = Binding;
//# sourceMappingURL=binding.js.map
