import type { IBaseScale } from '@visactor/vscale';
import type { DiscreteLegendAttrs, ColorLegendAttributes, SizeLegendAttributes } from '@visactor/vrender-components';
import type { IGroupMark, IScale, ITheme, IView, Nil, RecursivePartial } from '../types';
import type { ILegend, LegendSpec, LegendType } from '../types/component';
import { ScaleComponent } from './scale';
export declare const generateDiscreteLegendAttributes: (scale: IBaseScale, theme?: ITheme, addition?: RecursivePartial<DiscreteLegendAttrs>, shapeScale?: IBaseScale) => DiscreteLegendAttrs;
export declare const generateColorLegendAttributes: (scale: IBaseScale, theme?: ITheme, addition?: RecursivePartial<ColorLegendAttributes>) => ColorLegendAttributes;
export declare const generateSizeLegendAttributes: (scale: IBaseScale, theme?: ITheme, addition?: RecursivePartial<SizeLegendAttributes>) => SizeLegendAttributes;
export declare class Legend extends ScaleComponent implements ILegend {
    static readonly componentType: string;
    protected spec: LegendSpec;
    private _legendComponentType;
    constructor(view: IView, group?: IGroupMark);
    protected parseAddition(spec: LegendSpec): this;
    scale(scale?: IScale | string | Nil): this;
    shapeScale(shapeScale: LegendSpec['shapeScale']): this;
    legendType(legendType: LegendType | Nil): this;
    isContinuousLegend(): boolean;
    setSelected(selectedValues: any[]): this;
    addGraphicItem(attrs: any, groupKey?: string): any;
    protected _updateComponentEncoders(): void;
    private _getLegendComponentType;
}
export declare const registerLegend: () => void;
