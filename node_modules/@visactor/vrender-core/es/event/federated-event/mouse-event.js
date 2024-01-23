import { FederatedEvent } from "./base-event";

export class FederatedMouseEvent extends FederatedEvent {
    constructor() {
        super(...arguments), this.client = {
            x: 0,
            y: 0
        }, this.movement = {
            x: 0,
            y: 0
        }, this.offset = {
            x: 0,
            y: 0
        }, this.global = {
            x: 0,
            y: 0
        }, this.screen = {
            x: 0,
            y: 0
        };
    }
    get clientX() {
        return this.client.x;
    }
    get clientY() {
        return this.client.y;
    }
    get movementX() {
        return this.movement.x;
    }
    get movementY() {
        return this.movement.y;
    }
    get offsetX() {
        return this.offset.x;
    }
    get offsetY() {
        return this.offset.y;
    }
    get globalX() {
        return this.global.x;
    }
    get globalY() {
        return this.global.y;
    }
    get screenX() {
        return this.screen.x;
    }
    get screenY() {
        return this.screen.y;
    }
    getModifierState(key) {
        return "getModifierState" in this.nativeEvent && this.nativeEvent.getModifierState(key);
    }
    initMouseEvent(_typeArg, _canBubbleArg, _cancelableArg, _viewArg, _detailArg, _screenXArg, _screenYArg, _clientXArg, _clientYArg, _ctrlKeyArg, _altKeyArg, _shiftKeyArg, _metaKeyArg, _buttonArg, _relatedTargetArg) {
        throw new Error("Method not implemented.");
    }
}
//# sourceMappingURL=mouse-event.js.map
