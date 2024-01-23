import type { IGraphicAttribute, IGraphic } from '../graphic';
export type ICircleAttribute = {
    radius: number;
    startAngle: number;
    endAngle: number;
};
export type ICircleGraphicAttribute = Partial<IGraphicAttribute> & Partial<ICircleAttribute>;
export type ICircle = IGraphic<ICircleGraphicAttribute>;
