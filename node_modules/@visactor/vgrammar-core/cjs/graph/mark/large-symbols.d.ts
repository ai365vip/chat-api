import type { IGroupGraphicAttribute } from '@visactor/vrender-core';
import { Group } from '@visactor/vrender-core';
interface LargeSymbolsAttribute extends IGroupGraphicAttribute {
    size: number;
    points: Float32Array | number[];
}
export declare class LargeSymbols extends Group {
    constructor(attributes: LargeSymbolsAttribute);
    render(): void;
}
export {};
