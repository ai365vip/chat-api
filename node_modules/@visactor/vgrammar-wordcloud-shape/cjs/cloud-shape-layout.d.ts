import type { LayoutConfigType, SegmentationOutputType } from './interface';
export default function (words: any, layoutConfig: LayoutConfigType, segmentationOutput: SegmentationOutputType): {
    fillingWords: import("./interface").CloudWordType[];
    successedWords: any[];
    failedWords: any[];
};
