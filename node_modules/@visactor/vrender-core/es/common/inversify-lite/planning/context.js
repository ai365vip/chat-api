import { id } from "../utils/id";

class Context {
    constructor(container) {
        this.id = id(), this.container = container;
    }
    addPlan(plan) {
        this.plan = plan;
    }
    setCurrentRequest(currentRequest) {
        this.currentRequest = currentRequest;
    }
}

export { Context };
//# sourceMappingURL=context.js.map
