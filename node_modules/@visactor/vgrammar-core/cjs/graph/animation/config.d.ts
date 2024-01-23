import type { IElement } from '../../types';
import type { IAnimationConfig, IParsedAnimationConfig, MarkFunctionValueType } from '../../types/animate';
export declare function normalizeAnimationConfig(config: Record<string, IAnimationConfig | IAnimationConfig[]>): Array<IParsedAnimationConfig>;
export declare function normalizeStateAnimationConfig(state: string, config: IAnimationConfig | IAnimationConfig[], initialIndex?: number): Array<IParsedAnimationConfig>;
export declare function invokeAnimateSpec<T>(spec: MarkFunctionValueType<T>, element: IElement, parameters: any): T;
