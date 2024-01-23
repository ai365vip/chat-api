import { id } from "../utils/id";

class Request {
    constructor(serviceIdentifier, parentContext, parentRequest, bindings, target) {
        this.id = id(), this.serviceIdentifier = serviceIdentifier, this.parentContext = parentContext, 
        this.parentRequest = parentRequest, this.target = target, this.childRequests = [], 
        this.bindings = Array.isArray(bindings) ? bindings : [ bindings ], this.requestScope = null === parentRequest ? new Map : null;
    }
    addChildRequest(serviceIdentifier, bindings, target) {
        const child = new Request(serviceIdentifier, this.parentContext, this, bindings, target);
        return this.childRequests.push(child), child;
    }
}

export { Request };
//# sourceMappingURL=request.js.map
