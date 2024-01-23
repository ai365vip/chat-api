import { BaseCanvas } from '@visactor/vrender-core';
import type { ICanvas, CanvasConfigType, EnvType } from '@visactor/vrender-core';
export declare class FeishuCanvas extends BaseCanvas implements ICanvas {
    static env: EnvType;
    constructor(params: CanvasConfigType);
    init(): void;
    release(...params: any): void;
}
