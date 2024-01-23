import { Generator } from "../generator";

import { BindingScopeEnum, BindingTypeEnum } from "./literal_types";

class Binding {
    constructor(serviceIdentifier, scope) {
        this.id = Generator.GenAutoIncrementId(), this.activated = !1, this.serviceIdentifier = serviceIdentifier, 
        this.scope = scope, this.type = BindingTypeEnum.Invalid, this.constraint = request => !0, 
        this.implementationType = null, this.cache = null, this.factory = null, this.provider = null, 
        this.dynamicValue = null;
    }
    clone() {
        const clone = new Binding(this.serviceIdentifier, this.scope);
        return clone.activated = clone.scope === BindingScopeEnum.Singleton && this.activated, 
        clone.implementationType = this.implementationType, clone.dynamicValue = this.dynamicValue, 
        clone.scope = this.scope, clone.type = this.type, clone.provider = this.provider, 
        clone.constraint = this.constraint, clone.cache = this.cache, clone;
    }
}

export { Binding };
//# sourceMappingURL=binding.js.map
