import type { IBaseScale } from '@visactor/vscale';
import type { IView } from '../types/view';
import type { IGrammarBase } from '../types/grammar';
import type { ScaleFunctionType, ScaleData, MultiScaleData, ScaleSpec, ScaleConfigureSpec, GrammarScaleType } from '../types/scale';
export declare function createScale(type: GrammarScaleType): IBaseScale;
export declare function parseScaleDomainRange(domain: ScaleFunctionType<any> | ScaleData | MultiScaleData, view: IView): IGrammarBase[];
export declare function parseScaleConfig(type: GrammarScaleType, config: ScaleConfigureSpec, view: IView): IGrammarBase[];
export declare function configureScale(spec: ScaleSpec, scale: IBaseScale, parameters: any): void;
