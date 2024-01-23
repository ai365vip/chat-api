import type { IElement, JitterTransformOptions, JitterXTransformOptions, JitterYTransformOptions } from '../../types';
export declare const jitterY: (options: JitterYTransformOptions, upstreamData: IElement[]) => void | IElement[];
export declare const jitterX: (options: JitterXTransformOptions, upstreamData: IElement[]) => void | IElement[];
export declare const transform: (options: JitterTransformOptions, upstreamData: IElement[]) => IElement[];
