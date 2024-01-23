import type { IBoundsLike } from '@visactor/vutils';
export declare function bitmap(w: number, h: number): {
    array: Uint32Array;
    get: (x: number, y: number) => number;
    set: (x: number, y: number) => void;
    clear: (x: number, y: number) => void;
    getRange: ({ x1, y1, x2, y2 }: IBoundsLike) => boolean;
    setRange: ({ x1, y1, x2, y2 }: IBoundsLike) => void;
    clearRange: ({ x1, y1, x2, y2 }: IBoundsLike) => void;
    outOfBounds: ({ x1, y1, x2, y2 }: IBoundsLike) => boolean;
    toImageData: (ctx: CanvasRenderingContext2D) => ImageData;
};
export type Bitmap = ReturnType<typeof bitmap>;
