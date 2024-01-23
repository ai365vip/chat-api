import type { IGraphicAttribute, IGraphic } from '../graphic';
export type IIsogonAttribute = {
    radius: number;
    edgeNumber: number;
};
export type IIsogonGraphicAttribute = Partial<IGraphicAttribute> & Partial<IIsogonAttribute>;
export type IIsogon = IGraphic<IIsogonGraphicAttribute>;
