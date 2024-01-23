import type { IRectGraphicAttribute, ISymbolGraphicAttribute } from '@visactor/vrender-core';
import type { OrientType } from '../../interface';
import type { BaseGraphicAttributes } from '../../core/type';
import type { ControllerTypeEnum } from '../controller/constant';
export type BasePlayerLayoutAttributes = {
    orient?: OrientType;
    size: {
        width: number;
        height: number;
    };
    slider?: {
        visible?: boolean;
        space?: number;
        dx?: number;
        dy?: number;
        railStyle?: RailStyleType;
        trackStyle?: TrackStyleType;
        handlerStyle?: HandlerStyleType;
    };
    controller?: {
        visible: boolean;
        start?: ControllerType;
        pause?: ControllerType;
        forward?: ControllerType;
        backward?: ControllerType;
    };
};
export type RailStyleType = Partial<IRectGraphicAttribute>;
export type TrackStyleType = Partial<IRectGraphicAttribute>;
export type HandlerStyleType = Partial<ISymbolGraphicAttribute>;
export type ControllerLayout = {
    key?: ControllerTypeEnum;
    visible?: boolean;
    space?: number;
    order?: number;
    position?: 'start' | 'end';
};
export type ControllerType = ControllerLayout & BaseGraphicAttributes<Partial<ISymbolGraphicAttribute>>;
