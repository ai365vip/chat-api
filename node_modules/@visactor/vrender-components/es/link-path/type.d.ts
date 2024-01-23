import type { IGroupGraphicAttribute, IGraphicAttribute } from '@visactor/vrender-core';
import type { Direction } from '../interface';
export interface LinkPathAttributes extends IGroupGraphicAttribute {
    direction?: Direction;
    x0: number;
    y0: number;
    x1: number;
    y1: number;
    thickness: number;
    round?: boolean;
    ratio?: number;
    align?: 'start' | 'end' | 'center';
    isSmooth?: boolean;
    backgroudStyle?: Partial<IGraphicAttribute>;
    endArrow?: boolean;
    startArrow?: boolean;
}
