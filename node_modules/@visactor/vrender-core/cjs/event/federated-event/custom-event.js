"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.CustomEvent = void 0;

const base_event_1 = require("./base-event");

class CustomEvent extends base_event_1.FederatedEvent {
    constructor(eventName, object) {
        super(), this.type = eventName, this.detail = object;
    }
}

exports.CustomEvent = CustomEvent;
//# sourceMappingURL=custom-event.js.map
