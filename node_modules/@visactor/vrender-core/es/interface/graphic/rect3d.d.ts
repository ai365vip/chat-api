import type { IGraphic } from '../graphic';
import type { ICustomPath2D } from '../path';
import type { IRectGraphicAttribute } from './rect';
export type IRect3dGraphicAttribute = Partial<IRectGraphicAttribute> & {
    length?: number;
};
export interface IRect3d extends IGraphic {
    attribute: IRect3dGraphicAttribute;
    cache?: ICustomPath2D;
}
