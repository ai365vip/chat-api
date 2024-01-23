import { BindingWhenSyntax } from "./binding_when_syntax";

class BindingWhenOnSyntax {
    constructor(binding) {
        this._binding = binding, this._bindingWhenSyntax = new BindingWhenSyntax(this._binding);
    }
    whenTargetNamed(name) {
        return this._bindingWhenSyntax.whenTargetNamed(name);
    }
}

export { BindingWhenOnSyntax };
//# sourceMappingURL=binding_when_on_syntax.js.map
