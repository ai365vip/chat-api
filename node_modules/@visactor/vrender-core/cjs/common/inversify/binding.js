"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.Binding = void 0;

const generator_1 = require("../generator"), literal_types_1 = require("./literal_types");

class Binding {
    constructor(serviceIdentifier, scope) {
        this.id = generator_1.Generator.GenAutoIncrementId(), this.activated = !1, this.serviceIdentifier = serviceIdentifier, 
        this.scope = scope, this.type = literal_types_1.BindingTypeEnum.Invalid, this.constraint = request => !0, 
        this.implementationType = null, this.cache = null, this.factory = null, this.provider = null, 
        this.dynamicValue = null;
    }
    clone() {
        const clone = new Binding(this.serviceIdentifier, this.scope);
        return clone.activated = clone.scope === literal_types_1.BindingScopeEnum.Singleton && this.activated, 
        clone.implementationType = this.implementationType, clone.dynamicValue = this.dynamicValue, 
        clone.scope = this.scope, clone.type = this.type, clone.provider = this.provider, 
        clone.constraint = this.constraint, clone.cache = this.cache, clone;
    }
}

exports.Binding = Binding;
//# sourceMappingURL=binding.js.map
