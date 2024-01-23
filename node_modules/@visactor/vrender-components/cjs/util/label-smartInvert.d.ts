import type { IColor } from '@visactor/vrender-core';
export declare function labelSmartInvert(foregroundColorOrigin: IColor | undefined, backgroundColorOrogin: IColor | undefined, textType?: string | undefined, contrastRatiosThreshold?: number, alternativeColors?: string | string[], mode?: string): IColor | undefined;
export declare function contrastAccessibilityChecker(foregroundColor: IColor | undefined, backgroundColor: IColor | undefined, textType?: IColor | undefined, contrastRatiosThreshold?: number, mode?: string): boolean;
export declare function smartInvertStrategy(fillStrategy: string, baseColor: IColor, invertColor: IColor, similarColor: IColor): IColor;
