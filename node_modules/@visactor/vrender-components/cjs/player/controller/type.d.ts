import type { ISymbolGraphicAttribute } from '@visactor/vrender-core';
import type { BaseGraphicAttributes } from '../../core/type';
export interface ControllerAttributes {
    visible?: boolean;
    layout?: LayoutType;
    start: BaseGraphicAttributes<ISymbolGraphicAttribute> & {
        visible?: boolean;
    };
    pause: BaseGraphicAttributes<ISymbolGraphicAttribute> & {
        visible?: boolean;
    };
    forward: BaseGraphicAttributes<ISymbolGraphicAttribute> & {
        visible?: boolean;
    };
    backward: BaseGraphicAttributes<ISymbolGraphicAttribute> & {
        visible?: boolean;
    };
    disableTriggerEvent?: boolean;
}
export type LayoutType = 'horizontal' | 'vertical';
