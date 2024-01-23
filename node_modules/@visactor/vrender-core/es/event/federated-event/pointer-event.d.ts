import { FederatedMouseEvent } from './mouse-event';
export declare class FederatedPointerEvent extends FederatedMouseEvent implements PointerEvent {
    pickParams?: any;
    pointerId: number;
    width: number;
    height: number;
    isPrimary: boolean;
    pointerType: string;
    pressure: number;
    tangentialPressure: number;
    tiltX: number;
    tiltY: number;
    twist: number;
    detail: number;
    getCoalescedEvents(): PointerEvent[];
    getPredictedEvents(): PointerEvent[];
    clone(): FederatedPointerEvent;
}
