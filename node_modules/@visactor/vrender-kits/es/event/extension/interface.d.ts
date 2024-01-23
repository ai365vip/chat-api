import type { IFederatedPointerEvent } from '@visactor/vrender-core';
import type { IPointLike } from '@visactor/vutils';
export type GestureDirection = 'none' | 'left' | 'right' | 'down' | 'up';
export interface GestureEvent extends IFederatedPointerEvent {
    points: IPointLike[];
    direction: GestureDirection;
    deltaX: number;
    deltaY: number;
    scale: number;
    center: IPointLike;
    velocity: number;
}
export interface GestureConfig {
    press?: {
        time?: number;
        threshold?: number;
    };
    swipe?: {
        threshold?: number;
        velocity?: number;
    };
    tap?: {
        interval?: number;
    };
}
export interface DefaultGestureConfig {
    press: {
        time: number;
        threshold: number;
    };
    swipe: {
        threshold: number;
        velocity: number;
    };
    tap: {
        interval: number;
    };
}
export interface EmitEventObject {
    type: string;
    ev: GestureEvent;
}
