import type { IGraphicAttribute, IGraphic } from '../graphic';
export type IEllipseAttribute = {
    radiusX: number;
    radiusY: number;
};
export interface IEllipseGraphicAttribute extends Partial<IGraphicAttribute>, Partial<IEllipseAttribute> {
}
export type IEllipse = IGraphic<IEllipseGraphicAttribute>;
