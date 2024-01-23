import { BindingInSyntax } from "./binding_in_syntax";

import { BindingWhenSyntax } from "./binding_when_syntax";

class BindingInWhenOnSyntax {
    constructor(binding) {
        this._binding = binding, this._bindingWhenSyntax = new BindingWhenSyntax(this._binding), 
        this._bindingInSyntax = new BindingInSyntax(binding);
    }
    inRequestScope() {
        return this._bindingInSyntax.inRequestScope();
    }
    inSingletonScope() {
        return this._bindingInSyntax.inSingletonScope();
    }
    inTransientScope() {
        return this._bindingInSyntax.inTransientScope();
    }
    whenTargetNamed(name) {
        return this._bindingWhenSyntax.whenTargetNamed(name);
    }
}

export { BindingInWhenOnSyntax };
//# sourceMappingURL=binding_in_when_on_syntax.js.map
