import type { IRichTextGraphicAttribute } from '@visactor/vrender-core';
import type { TooltipRowAttrs, TooltipRowStyleAttrs, TooltipTextAttrs } from './type';
export declare const mergeRowAttrs: (target: TooltipRowAttrs | TooltipRowStyleAttrs, ...sources: (TooltipRowAttrs | TooltipRowStyleAttrs)[]) => TooltipRowAttrs | TooltipRowStyleAttrs;
export declare const getRichTextAttribute: (attr: TooltipTextAttrs) => IRichTextGraphicAttribute;
