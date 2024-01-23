import type { IView, IMark, IViewAnimate } from '../types';
export declare class ViewAnimate implements IViewAnimate {
    private _view;
    private _animations;
    private _additionalAnimateMarks;
    private isEnabled;
    constructor(view: IView);
    stop(): this;
    pause(): this;
    resume(): this;
    enable(): this;
    disable(): this;
    enableAnimationState(state: string | string[]): this;
    disableAnimationState(state: string | string[]): this;
    isAnimating(): boolean;
    animate(): this;
    animateAddition(additionMark: IMark): this;
    private _onAnimationStart;
    private _onAnimationEnd;
    release(): void;
}
