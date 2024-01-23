import { BindingOnSyntax } from "./binding_on_syntax";

import { namedConstraint } from "./constraint_helpers";

class BindingWhenSyntax {
    constructor(binding) {
        this._binding = binding;
    }
    whenTargetNamed(name) {
        return this._binding.constraint = namedConstraint(name), new BindingOnSyntax(this._binding);
    }
}

export { BindingWhenSyntax };
//# sourceMappingURL=binding_when_syntax.js.map
