import type { IContext2d, EnvType, ICanvas } from '@visactor/vrender-core';
import { BrowserContext2d } from '../browser';
export declare class NodeContext2d extends BrowserContext2d implements IContext2d {
    static env: EnvType;
    constructor(canvas: ICanvas, dpr: number);
    release(...params: any): void;
}
