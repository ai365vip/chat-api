import { BaseCanvas } from '@visactor/vrender-core';
import type { CanvasConfigType, ICanvas, EnvType } from '@visactor/vrender-core';
export declare class BrowserCanvas extends BaseCanvas implements ICanvas {
    static env: EnvType;
    constructor(params: CanvasConfigType);
    init(params: CanvasConfigType): void;
    protected initStyle(): void;
    hide(): void;
    show(): void;
    applyPosition(): void;
    resetStyle(params: Partial<CanvasConfigType>): void;
    private setCanvasStyle;
    toDataURL(): string;
    toDataURL(mimeType: 'image/png'): string;
    toDataURL(mimeType: 'image/jpeg', quality: number): string;
    resize(width: number, height: number): void;
}
