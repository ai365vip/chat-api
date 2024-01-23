import type { IContext2d, EnvType, ISetStrokeStyleParams, IStrokeStyleParams } from '@visactor/vrender-core';
import { BrowserContext2d } from '../browser';
export declare class LynxContext2d extends BrowserContext2d implements IContext2d {
    static env: EnvType;
    drawPromise?: Promise<any>;
    _globalAlpha: number;
    get globalAlpha(): number;
    set globalAlpha(ga: number);
    setLineDash(segments: number[]): void;
    protected _setStrokeStyle(params: ISetStrokeStyleParams, attribute: IStrokeStyleParams, offsetX: number, offsetY: number, defaultParams?: IStrokeStyleParams): void;
    measureText(text: string, method?: 'native' | 'simple' | 'quick'): {
        width: number;
    };
    createPattern(image: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement, repetition: string): CanvasPattern;
    draw(): void;
}
