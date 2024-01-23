import type { IAnimate, ITimeline } from '../interface';
export declare class DefaultTimeline implements ITimeline {
    id: number;
    protected animateHead: IAnimate | null;
    protected animateTail: IAnimate | null;
    protected ticker: any;
    animateCount: number;
    protected paused: boolean;
    constructor();
    addAnimate(animate: IAnimate): void;
    pause(): void;
    resume(): void;
    tick(delta: number): void;
    clear(): void;
    removeAnimate(animate: IAnimate, release?: boolean): void;
}
export declare const defaultTimeline: DefaultTimeline;
