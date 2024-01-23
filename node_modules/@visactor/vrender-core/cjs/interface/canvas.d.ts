import type { Releaseable } from './common';
import type { IContextLike, IContext2d } from './context';
export type CanvasConfigType = {
    width?: number;
    height?: number;
    dpr?: number;
    x?: number;
    y?: number;
    container?: HTMLElement | string;
    visiable?: boolean;
    nativeCanvas: HTMLCanvasElement | any;
    canvasControled?: boolean;
    id?: string;
};
export interface ICanvas extends Releaseable {
    width: number;
    height: number;
    id: number | string;
    x: number;
    y: number;
    visiable: boolean;
    nativeCanvas: HTMLCanvasElement | any;
    displayWidth: number;
    displayHeight: number;
    dpr: number;
    getContext: (contextId?: '2d', contextAttributes?: CanvasRenderingContext2DSettings) => IContext2d | null;
    getNativeCanvas: () => HTMLCanvasElement | any;
    convertToBlob: (options?: {
        type?: string | undefined;
        quality?: number | undefined;
    }) => Promise<Blob>;
    transferToImageBitmap: () => ImageBitmap;
    resetStyle: (params: Partial<CanvasConfigType>) => void;
    applyPosition: () => void;
    hide: () => void;
    show: () => void;
    resize: (width: number, height: number) => void;
    toDataURL: (() => string) & ((mimeType: 'image/png') => string) & ((mimeType: 'image/jpeg', quality: number) => string);
    readPixels: (x: number, y: number, w: number, h: number) => ImageData | Promise<ImageData>;
    release: () => void;
}
export interface ICanvasLike {
    width: number;
    height: number;
    readonly type?: 'image' | 'pdf' | 'svg';
    readonly stride?: number;
    readonly PNG_NO_FILTERS?: number;
    readonly PNG_ALL_FILTERS?: number;
    readonly PNG_FILTER_NONE?: number;
    readonly PNG_FILTER_SUB?: number;
    readonly PNG_FILTER_UP?: number;
    readonly PNG_FILTER_AVG?: number;
    readonly PNG_FILTER_PAETH?: number;
    getContext: (contextId: string) => IContextLike;
}
export interface ICanvasFactory extends Function {
    (...params: any): ICanvas;
}
export interface IContext2dFactory extends Function {
    (...params: any): IContext2d;
}
