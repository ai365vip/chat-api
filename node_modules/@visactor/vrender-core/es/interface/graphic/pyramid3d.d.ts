import type { IGraphic } from '../graphic';
import type { IPolygonGraphicAttribute } from './polygon';
export type IPyramid3dGraphicAttribute = Partial<IPolygonGraphicAttribute> & {
    depthRatio?: number;
    face?: [boolean, boolean, boolean, boolean, boolean, boolean];
};
export type IPyramid3d = IGraphic<IPyramid3dGraphicAttribute>;
