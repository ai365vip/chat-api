import { BaseEnvContribution } from '@visactor/vrender-core';
import type { EnvType, ICreateCanvasParams, IEnvContribution, IGlobal } from '@visactor/vrender-core';
type Canvas = any;
type NodePkg = {
    createCanvas: (width: number, height: number, type?: 'pdf' | 'svg') => Canvas;
    createImageData: (data: Uint8ClampedArray, width: number, height?: number) => ImageData;
    loadImage: (src: string | any, options?: any) => Promise<any>;
    Resvg?: any;
};
export declare class NodeEnvContribution extends BaseEnvContribution implements IEnvContribution {
    type: EnvType;
    pkg: NodePkg;
    _lastTime: number;
    supportEvent: boolean;
    configure(service: IGlobal, pkg: NodePkg): void;
    getDynamicCanvasCount(): number;
    getStaticCanvasCount(): number;
    loadJson(url: string): Promise<{
        loadState: 'success' | 'fail';
        data: Record<string, unknown> | null;
    }>;
    loadArrayBuffer(url: string): Promise<{
        loadState: 'success' | 'fail';
        data: ArrayBuffer | null;
    }>;
    loadImage(url: string): Promise<{
        loadState: 'success' | 'fail';
        data: HTMLImageElement | null;
    }>;
    loadSvg(svgStr: string): Promise<{
        loadState: 'success' | 'fail';
        data: HTMLImageElement | null;
    }>;
    createCanvas(params: any): Canvas;
    releaseCanvas(canvas: Canvas | any): void;
    getDevicePixelRatio(): number;
    getRequestAnimationFrame(): (callback: FrameRequestCallback) => number;
    getCancelAnimationFrame(): (h: number) => void;
    addEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => any, options?: boolean | AddEventListenerOptions | undefined): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions | undefined): void;
    removeEventListener<K extends keyof DocumentEventMap>(type: K, listener: (this: Document, ev: DocumentEventMap[K]) => any, options?: boolean | EventListenerOptions | undefined): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions | undefined): void;
    getElementById(str: string): HTMLElement | null;
    getRootElement(): HTMLElement | null;
    dispatchEvent(event: any): boolean;
    release(...params: any): void;
    createOffscreenCanvas(params: ICreateCanvasParams): void;
}
export {};
