import type { IProgressiveTransformResult } from '@visactor/vgrammar-core';
import type { IBaseLayoutOptions, TagItemAttribute } from './interface';
import { BaseLayout } from './base';
export interface TagItem {
    datum: any;
    width: number;
    height: number;
    text: string;
    fontSize: number;
    fontWeight: string;
    fontStyle: string;
    fontFamily: string;
    angle: number;
    x: number;
    y: number;
    top: number;
    left: number;
}
interface IFastLayoutOptions extends IBaseLayoutOptions {
    padding?: TagItemAttribute<number>;
    enlarge?: boolean;
}
export declare class FastLayout extends BaseLayout<IFastLayoutOptions> implements IProgressiveTransformResult {
    private random;
    private center;
    private aspectRatio;
    private maxRadius;
    private width;
    private height;
    static defaultOptions: Partial<IFastLayoutOptions>;
    constructor(options: IFastLayoutOptions);
    private fit;
    private getTextInfo;
    layoutWord(index: number): boolean;
    layout(data: any[], config: {
        width: number;
        height: number;
    }): import("./interface").TagOutputItem[];
}
export {};
