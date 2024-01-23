import type { IGraphicAttribute, IGraphic } from '../graphic';
export interface ISvgAttribute {
    path: string;
}
export interface ISvgGraphicAttribute extends Partial<IGraphicAttribute>, ISvgAttribute {
}
export type ISvg = IGraphic<ISvgGraphicAttribute>;
