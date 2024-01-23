export type SupportResourceType = 'json' | 'image' | 'svg' | 'bitmap' | 'canvas' | 'arrayBuffer' | 'blob' | 'imageData' | 'offscreenCanvas';
export interface ResourceData {
    type: SupportResourceType;
    data?: HTMLImageElement | ImageBitmap | OffscreenCanvas | ArrayBuffer | Blob | ImageData | {
        [id: string]: any;
    } | null;
    dataPromise?: Promise<{
        loadState: 'success' | 'fail';
        data: HTMLImageElement | ImageData | ArrayBuffer | Blob | Record<string, unknown> | null;
    }>;
    loadState: 'init' | 'loading' | 'success' | 'fail';
    waitingMark?: ImagePayload[];
}
export interface ImagePayload {
    imageLoadFail: (url: string) => void;
    imageLoadSuccess: (url: string, data: HTMLImageElement) => void;
}
