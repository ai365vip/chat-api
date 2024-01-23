import type { ICanvas, Releaseable, IAllocate } from '../interface';
export declare class DefaultCanvasAllocate implements IAllocate<ICanvas>, Releaseable {
    protected pools: ICanvas[];
    protected _commonCanvas: any;
    protected allocatedCanvas: ICanvas[];
    shareCanvas(): ICanvas;
    getCommonCanvas(): ICanvas;
    allocate(data: {
        width: number;
        height: number;
        dpr: number;
    }): ICanvas;
    allocateByObj(canvas: ICanvas): ICanvas;
    free(d: ICanvas): void;
    get length(): number;
    release(...params: any): void;
}
export declare const canvasAllocate: DefaultCanvasAllocate;
