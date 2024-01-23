import type { IEventTarget, IEventExtension } from '@visactor/vrender-core';
export declare class DragNDrop implements IEventExtension {
    rootNode: IEventTarget | null;
    constructor(rootNode: IEventTarget);
    initEvents(): void;
    removeEvents(): void;
    release(): void;
    private onPointerDown;
}
