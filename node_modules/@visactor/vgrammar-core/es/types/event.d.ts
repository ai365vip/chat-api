import type { CustomEvent, FederatedEvent } from '@visactor/vrender-core';
import type { IAnimationConfig, IElement, IGlyphElement, IMark } from '.';
import type { MarkType } from './mark';
import type { SignalDependency } from './signal';
export type AnimationEvent = {
    mark: IMark;
    animationState: string;
    animationConfig: IAnimationConfig;
};
export type InteractionEvent = (FederatedEvent | CustomEvent) & {
    element?: IElement | IGlyphElement;
};
export type GrammarEvent = InteractionEvent | AnimationEvent;
export type EventHandler<T> = (event?: GrammarEvent, value?: T) => void;
export type BaseEventHandler = AnimationEventHandler | InteractionEventHandler;
export type AnimationEventHandler = (event?: AnimationEvent) => void;
export type InteractionEventHandler = (event?: InteractionEvent, element?: IElement | IGlyphElement) => void;
export type ResizeHandler = EventHandler<{
    width?: number;
    height?: number;
}>;
export type AnimationEventType = 'animationStart' | 'animationEnd' | 'elementAnimationStart' | 'elementAnimationEnd';
export type AnimationListenerHandler = (event?: AnimationEvent, el?: IElement) => void;
export type ViewEventType = 'view:pointerdown' | 'view:pointerup' | 'view:pointerupoutside' | 'view:pointertap' | 'view:pointerover' | 'view:pointerenter' | 'view:pointerleave' | 'view:pointerout' | 'view:mousedown' | 'view:mouseup' | 'view:mouseupoutside' | 'view:rightdown' | 'view:rightup' | 'view:rightupoutside' | 'view:click' | 'view:dblclick' | 'view:mousemove' | 'view:mouseover' | 'view:mouseout' | 'view:mouseenter' | 'view:mouseleave' | 'view:wheel' | 'view:tap' | 'view:touchstart' | 'view:touchend' | 'view:touchendoutside' | 'view:touchmove' | 'view:touchcancel' | 'view:dragstart' | 'view:drag' | 'view:dragenter' | 'view:dragleave' | 'view:dragover' | 'view:dragend' | 'view:drop' | 'view:pan' | 'view:panstart' | 'view:panend' | 'view:press' | 'view:pressup' | 'view:pressend' | 'view:pinch' | 'view:pinchstart' | 'view:pinchend' | 'view:swipe';
export type EventType = 'pointerdown' | 'pointerup' | 'pointermove' | 'pointerupoutside' | 'pointertap' | 'pointerover' | 'pointermove' | 'pointerenter' | 'pointerleave' | 'pointerout' | 'mousedown' | 'mouseup' | 'mouseupoutside' | 'rightdown' | 'rightup' | 'rightupoutside' | 'click' | 'dblclick' | 'mousemove' | 'mouseover' | 'mouseout' | 'mouseenter' | 'mouseleave' | 'wheel' | 'tap' | 'touchstart' | 'touchend' | 'touchendoutside' | 'touchmove' | 'touchcancel' | 'dragstart' | 'drag' | 'dragenter' | 'dragleave' | 'dragover' | 'dragend' | 'drop' | 'pan' | 'panstart' | 'panend' | 'press' | 'pressup' | 'pressend' | 'pinch' | 'pinchstart' | 'pinchend' | 'swipe' | 'resize';
export type WindowEventType = string;
export interface EventCallbackContext extends Event {
    element?: any;
    datum?: any;
}
export type EventCallback = (context: EventCallbackContext, params?: any) => any;
export interface BaseEventSpec {
    type: string;
    filter?: (context: EventCallbackContext) => boolean;
    throttle?: number;
    debounce?: number;
    consume?: boolean;
    callback?: EventCallback;
    dependency?: SignalDependency | SignalDependency[];
    target?: string | Array<{
        target: string;
        callback: EventCallback;
    }>;
}
export type MergeEventSpec = Omit<BaseEventSpec, 'type'> & {
    merge: string[] | BaseEventSpec[];
};
export interface ParsedViewEventSpec extends BaseEventSpec {
    source?: 'view';
    type: EventType;
    markId?: string;
    markName?: string;
    markType?: string;
}
export interface ParsedWindowEventSpec extends BaseEventSpec {
    source: 'window';
    type: WindowEventType;
    markId?: string;
    markName?: string;
    markType?: MarkType;
}
export type EventSpec = BaseEventSpec | ({
    between: [BaseEventSpec, BaseEventSpec];
} & BaseEventSpec) | MergeEventSpec;
export type EventSourceType = 'window' | 'view';
