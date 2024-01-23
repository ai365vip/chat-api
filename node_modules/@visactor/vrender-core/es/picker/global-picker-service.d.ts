import type { IMatrix, IPointLike } from '@visactor/vutils';
import type { IGraphic, IGroup, EnvType, IGlobal, IPickerService, IGraphicPicker, IPickParams, PickResult } from '../interface';
export declare class DefaultGlobalPickerService implements IPickerService {
    type: 'global';
    pickerMap: Map<number, IGraphicPicker>;
    global: IGlobal;
    constructor();
    configure(global: IGlobal, env: EnvType): void;
    pick(graphics: IGraphic[], point: IPointLike, params?: IPickParams): PickResult;
    containsPoint(graphic: IGraphic, point: IPointLike, params?: IPickParams): boolean;
    pickGroup(group: IGroup, point: IPointLike, parentMatrix: IMatrix, params?: IPickParams): PickResult;
    pickItem(graphic: IGraphic, point: IPointLike, parentMatrix: IMatrix | null, params?: IPickParams): PickResult | null;
}
