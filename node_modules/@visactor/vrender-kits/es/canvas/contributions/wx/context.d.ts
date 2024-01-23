import type { IContext2d, EnvType } from '@visactor/vrender-core';
import { BrowserContext2d } from '../browser';
export declare class WxContext2d extends BrowserContext2d implements IContext2d {
    static env: EnvType;
    draw(): void;
    createPattern(image: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement, repetition: string): CanvasPattern;
}
