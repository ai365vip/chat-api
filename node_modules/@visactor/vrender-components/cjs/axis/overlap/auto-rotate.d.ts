import type { IText, TextAlignType, TextBaselineType } from '@visactor/vrender-core';
type RotateConfig = {
    orient: string;
    labelRotateAngle?: number[];
};
export declare function autoRotate(items: IText[], rotateConfig: RotateConfig): void;
export declare function rotateYAxis(orient: string, items: IText[]): void;
export declare function rotateXAxis(orient: string, items: IText[]): void;
export declare function getXAxisLabelAlign(orient: string, angle?: number): {
    textAlign: TextAlignType;
    textBaseline: TextBaselineType;
};
export declare function getYAxisLabelAlign(orient: string, angle?: number): {
    textAlign: TextAlignType;
    textBaseline: TextBaselineType;
};
export {};
