import type { IPathGraphicAttribute } from '@visactor/vrender-core';
import type { SliderAttributes } from '../../slider/type';
import type { LegendBaseAttributes } from '../type';
export type SizeLegendAttributes = {
    sizeBackground?: Partial<IPathGraphicAttribute>;
} & Omit<SliderAttributes, 'step' | 'range'> & LegendBaseAttributes;
