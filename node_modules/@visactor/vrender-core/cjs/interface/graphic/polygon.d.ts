import type { IPointLike } from '@visactor/vutils';
import type { IGraphicAttribute, IGraphic } from '../graphic';
export type IPolygonAttribute = {
    points: IPointLike[];
    cornerRadius?: number | number[];
    closePath?: boolean;
};
export type IPolygonGraphicAttribute = Partial<IGraphicAttribute> & Partial<IPolygonAttribute>;
export type IPolygon = IGraphic<IPolygonGraphicAttribute>;
