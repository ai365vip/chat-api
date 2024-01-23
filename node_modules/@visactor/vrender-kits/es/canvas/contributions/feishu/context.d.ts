import type { IContext2d, EnvType } from '@visactor/vrender-core';
import { BrowserContext2d } from '../browser';
export declare class FeishuContext2d extends BrowserContext2d implements IContext2d {
    static env: EnvType;
    drawPromise?: Promise<any>;
    _globalAlpha: number;
    get globalAlpha(): number;
    set globalAlpha(ga: number);
    getImageData(sx: number, sy: number, sw: number, sh: number): any;
    draw(): void;
    createPattern(image: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement, repetition: string): CanvasPattern;
}
