import { BindingScopeEnum } from "../constants/literal_types";

import { BindingWhenOnSyntax } from "./binding_when_on_syntax";

class BindingInSyntax {
    constructor(binding) {
        this._binding = binding;
    }
    inRequestScope() {
        return this._binding.scope = BindingScopeEnum.Request, new BindingWhenOnSyntax(this._binding);
    }
    inSingletonScope() {
        return this._binding.scope = BindingScopeEnum.Singleton, new BindingWhenOnSyntax(this._binding);
    }
    inTransientScope() {
        return this._binding.scope = BindingScopeEnum.Transient, new BindingWhenOnSyntax(this._binding);
    }
}

export { BindingInSyntax };
//# sourceMappingURL=binding_in_syntax.js.map
