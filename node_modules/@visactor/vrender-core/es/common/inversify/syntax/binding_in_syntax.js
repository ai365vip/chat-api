import { BindingScopeEnum } from "../literal_types";

import { namedConstraint } from "./constraint_helpers";

class BindingInSyntax {
    constructor(binding) {
        this._binding = binding;
    }
    inRequestScope() {
        throw new Error("暂未实现");
    }
    inSingletonScope() {
        return this._binding.scope = BindingScopeEnum.Singleton, this;
    }
    inTransientScope() {
        return this._binding.scope = BindingScopeEnum.Transient, this;
    }
    whenTargetNamed(name) {
        return this._binding.constraint = namedConstraint(name), this;
    }
}

export { BindingInSyntax };
//# sourceMappingURL=binding_in_syntax.js.map
