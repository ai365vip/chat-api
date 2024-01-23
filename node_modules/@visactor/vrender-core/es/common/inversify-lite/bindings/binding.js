import { BindingScopeEnum, BindingTypeEnum } from "../constants/literal_types";

import { id } from "../utils/id";

class Binding {
    constructor(serviceIdentifier, scope) {
        this.id = id(), this.activated = !1, this.serviceIdentifier = serviceIdentifier, 
        this.scope = scope, this.type = BindingTypeEnum.Invalid, this.constraint = request => !0, 
        this.implementationType = null, this.cache = null, this.factory = null, this.provider = null, 
        this.onActivation = null, this.onDeactivation = null, this.dynamicValue = null;
    }
    clone() {
        const clone = new Binding(this.serviceIdentifier, this.scope);
        return clone.activated = clone.scope === BindingScopeEnum.Singleton && this.activated, 
        clone.implementationType = this.implementationType, clone.dynamicValue = this.dynamicValue, 
        clone.scope = this.scope, clone.type = this.type, clone.factory = this.factory, 
        clone.provider = this.provider, clone.constraint = this.constraint, clone.onActivation = this.onActivation, 
        clone.onDeactivation = this.onDeactivation, clone.cache = this.cache, clone;
    }
}

export { Binding };
//# sourceMappingURL=binding.js.map
