import type { TooltipAttributes, TooltipRowAttrs } from '@visactor/vrender-components';
import { Tooltip as TooltipComponent } from '@visactor/vrender-components';
import type { IBounds, IPointLike } from '@visactor/vutils';
import { BaseInteraction } from './base';
import type { IMark, ITheme, ITooltipRow, IView, RecursivePartial, TooltipOptions } from '../types';
export declare const generateTooltipAttributes: (point: IPointLike, title: TooltipRowAttrs, content: TooltipRowAttrs[], bounds: IBounds, theme?: ITheme, addition?: RecursivePartial<TooltipAttributes>) => TooltipAttributes;
export declare abstract class BaseTooltip<T extends TooltipOptions> extends BaseInteraction<T> {
    options: T;
    protected _tooltipComponent?: TooltipComponent;
    protected _marks?: IMark[];
    constructor(view: IView, options?: T);
    bind(): void;
    unbind(): void;
    protected _computeTooltipRow(row: ITooltipRow, datum: any): {
        visible: boolean;
        key: object;
        value: object;
        shape: object;
    };
    protected _computeTitleContent(datum: any): {
        title: TooltipRowAttrs | {
            visible: boolean;
            key: object;
            value: object;
            shape: object;
        };
        content: any;
    };
}
