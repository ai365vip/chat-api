import type { Direction, OrientType, ScrollBarAttributes } from '@visactor/vrender-components';
import type { IGroupMark, ITheme, IView, MarkFunctionType, Nil, RecursivePartial } from '../types';
import type { IScrollbar, ScrollbarSpec } from '../types/component';
import { ScaleComponent } from './scale';
export declare const generateScrollbarAttributes: (groupSize: {
    width: number;
    height: number;
}, direction?: Direction, position?: OrientType, theme?: ITheme, addition?: RecursivePartial<ScrollBarAttributes>) => ScrollBarAttributes;
export declare class Scrollbar extends ScaleComponent implements IScrollbar {
    static readonly componentType: string;
    protected spec: ScrollbarSpec;
    constructor(view: IView, group?: IGroupMark);
    protected parseAddition(spec: ScrollbarSpec): this;
    container(container: IGroupMark | string | Nil): this;
    direction(direction: MarkFunctionType<Direction> | Nil): this;
    position(position: MarkFunctionType<OrientType> | Nil): this;
    setScrollStart(start: number): this;
    getScrollRange(): [number, number];
    addGraphicItem(attrs: any, groupKey?: string): any;
    protected _updateComponentEncoders(): void;
}
export declare const registerScrollbar: () => void;
