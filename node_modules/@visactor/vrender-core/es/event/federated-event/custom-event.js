import { FederatedEvent } from "./base-event";

export class CustomEvent extends FederatedEvent {
    constructor(eventName, object) {
        super(), this.type = eventName, this.detail = object;
    }
}
//# sourceMappingURL=custom-event.js.map
