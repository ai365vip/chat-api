import type { IGroupGraphicAttribute } from '@visactor/vrender-core';
import { Group } from '@visactor/vrender-core';
interface LargeRectsAttribute extends IGroupGraphicAttribute {
    points: Float32Array | number[];
}
export declare class LargeRects extends Group {
    constructor(attributes: LargeRectsAttribute);
    render(): void;
}
export {};
