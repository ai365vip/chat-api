import type { IGraphic, MorphingAnimateConfig, EasingType, MultiMorphingAnimateConfig, IGraphicAttribute } from './../interface';
import { CustomPath2D } from '../common/custom-path2d';
import { ACustomAnimate } from './animate';
import type { IMatrix } from '@visactor/vutils';
interface MorphingDataItem {
    from: number[];
    to: number[];
    fromCp: number[];
    toCp: number[];
    rotation: number;
}
interface OtherAttrItem {
    from: any;
    to: any;
    key: string;
}
export declare class MorphingPath extends ACustomAnimate<number> {
    path: CustomPath2D;
    saveOnEnd?: boolean;
    otherAttrs?: OtherAttrItem[];
    constructor(config: {
        morphingData: MorphingDataItem[];
        otherAttrs?: OtherAttrItem[];
        saveOnEnd?: boolean;
    }, duration: number, easing: EasingType);
    private morphingData?;
    getEndProps(): Record<string, any>;
    onBind(): void;
    onEnd(): void;
    onUpdate(end: boolean, ratio: number, out: Record<string, any>): void;
}
export declare const morphPath: (fromGraphic: IGraphic | null, toGraphic: IGraphic, animationConfig?: MorphingAnimateConfig, fromGraphicTransform?: IMatrix) => import("./../interface").IAnimate;
export declare const oneToMultiMorph: (fromGraphic: IGraphic, toGraphics: IGraphic[], animationConfig?: MultiMorphingAnimateConfig) => void;
export declare class MultiToOneMorphingPath extends ACustomAnimate<number> {
    path: CustomPath2D;
    otherAttrs?: OtherAttrItem[][];
    constructor(config: {
        morphingData: MorphingDataItem[][];
        otherAttrs?: OtherAttrItem[][];
    }, duration: number, easing: EasingType);
    private morphingData?;
    getEndProps(): Record<string, any>;
    onBind(): void;
    private addPathProxy;
    private clearPathProxy;
    onEnd(): void;
    onUpdate(end: boolean, ratio: number, out: Record<string, any>): void;
}
export declare const cloneGraphic: (graphic: IGraphic, count: number, needAppend?: boolean) => IGraphic<Partial<IGraphicAttribute>>[];
export declare const splitGraphic: (graphic: IGraphic, count: number, needAppend?: boolean) => IGraphic<Partial<IGraphicAttribute>>[];
export declare const multiToOneMorph: (fromGraphics: IGraphic[], toGraphic: IGraphic, animationConfig?: MultiMorphingAnimateConfig) => void;
export {};
