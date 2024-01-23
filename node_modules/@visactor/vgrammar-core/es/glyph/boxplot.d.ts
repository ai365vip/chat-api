import type { IGlyphElement, TypeAnimation } from '../types';
export interface IBoxplotScaleAnimationOptions {
    center?: number;
}
export declare const boxplotScaleIn: TypeAnimation<IGlyphElement<any>>;
export declare const boxplotScaleOut: TypeAnimation<IGlyphElement<any>>;
export declare function registerBoxplotGlyph(): void;
export declare const barBoxplotScaleIn: TypeAnimation<IGlyphElement<any>>;
export declare const barBoxplotScaleOut: TypeAnimation<IGlyphElement<any>>;
export declare function registerBarBoxplotGlyph(): void;
