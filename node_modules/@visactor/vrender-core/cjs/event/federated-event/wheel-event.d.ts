import { FederatedMouseEvent } from './mouse-event';
export declare class FederatedWheelEvent extends FederatedMouseEvent implements WheelEvent {
    deltaMode: number;
    deltaX: number;
    deltaY: number;
    deltaZ: number;
    static readonly DOM_DELTA_PIXEL = 0;
    readonly DOM_DELTA_PIXEL = 0;
    static readonly DOM_DELTA_LINE = 1;
    readonly DOM_DELTA_LINE = 1;
    static readonly DOM_DELTA_PAGE = 2;
    readonly DOM_DELTA_PAGE = 2;
    clone(): FederatedWheelEvent;
}
