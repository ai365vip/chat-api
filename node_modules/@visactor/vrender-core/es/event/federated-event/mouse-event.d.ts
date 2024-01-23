import { FederatedEvent } from './base-event';
import type { EventPoint } from '../../interface';
export declare class FederatedMouseEvent extends FederatedEvent<MouseEvent | PointerEvent | TouchEvent> implements MouseEvent {
    altKey: boolean;
    button: number;
    buttons: number;
    ctrlKey: boolean;
    metaKey: boolean;
    relatedTarget: EventTarget | null;
    shiftKey: boolean;
    client: EventPoint;
    get clientX(): number;
    get clientY(): number;
    detail: number;
    movement: EventPoint;
    get movementX(): number;
    get movementY(): number;
    offset: EventPoint;
    get offsetX(): number;
    get offsetY(): number;
    global: EventPoint;
    get globalX(): number;
    get globalY(): number;
    screen: EventPoint;
    get screenX(): number;
    get screenY(): number;
    getModifierState(key: string): boolean;
    initMouseEvent(_typeArg: string, _canBubbleArg: boolean, _cancelableArg: boolean, _viewArg: Window, _detailArg: number, _screenXArg: number, _screenYArg: number, _clientXArg: number, _clientYArg: number, _ctrlKeyArg: boolean, _altKeyArg: boolean, _shiftKeyArg: boolean, _metaKeyArg: boolean, _buttonArg: number, _relatedTargetArg: EventTarget): void;
}
