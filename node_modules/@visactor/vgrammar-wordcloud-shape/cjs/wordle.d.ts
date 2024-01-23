import type { CloudWordType, LayoutConfigType, SegmentationOutputType } from './interface';
export declare function layout(words: CloudWordType[], layoutConfig: LayoutConfigType, segmentationOutput: SegmentationOutputType): void;
export declare function layoutSelfShrink(words: CloudWordType, layoutConfig: LayoutConfigType, segmentationOutput: SegmentationOutputType): void;
export declare function layoutGlobalShrink(words: CloudWordType[], layoutConfig: LayoutConfigType, segmentationOutput: SegmentationOutputType): void;
export declare function layoutSelfEnlarge(words: CloudWordType[], layoutConfig: LayoutConfigType, segmentationOutput: SegmentationOutputType): void;
export declare function placeWordOnBoard(word: CloudWordType, board: number[], boardSize: [number, number]): void;
export declare function isCollideWithBoard(word: CloudWordType, board: number[], boardSize: [number, number]): boolean;
export declare function measureSprite(canvas: HTMLCanvasElement | any, ctx: CanvasRenderingContext2D | null, words: CloudWordType[] | any, wi: number): void;
