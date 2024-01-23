import type { EasingType, IGraphic } from '@visactor/vrender-core';
import { ACustomAnimate } from '@visactor/vrender-core';
import type { IAnimationChannelInterpolator, IAnimationEffect, IAnimationParameters, IElement, IParsedAnimationAttrs } from '../../types';
export declare function typeAnimationAttributes(element: IElement, effect: IAnimationEffect, animationParameters: IAnimationParameters, parameters: any): IParsedAnimationAttrs;
export declare function channelAnimationAttributes(element: IElement, effect: IAnimationEffect, animationParameters: IAnimationParameters, parameters: any): IParsedAnimationAttrs;
export declare class CustomInterpolator extends ACustomAnimate<any> {
    private _element;
    private _interpolator?;
    constructor(from: any, to: any, duration: number, easing: EasingType, params: {
        interpolator: IAnimationChannelInterpolator;
        element: IElement;
        parameters?: any;
    });
    onBind(): void;
    getEndProps(): void | Record<string, any>;
    onUpdate(end: boolean, ratio: number, out: Record<string, any>): void;
}
export declare class AttributeAnimate extends ACustomAnimate<any> {
    target: IGraphic;
    private _fromAttribute;
    private _toAttribute;
    getEndProps(): Record<string, any>;
    onBind(): void;
    onStart(): void;
    onEnd(): void;
    update(end: boolean, ratio: number, out: Record<string, any>): void;
    onUpdate(end: boolean, ratio: number, out: Record<string, any>): void;
}
