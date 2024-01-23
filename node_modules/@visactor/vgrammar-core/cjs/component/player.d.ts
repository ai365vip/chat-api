import type { ContinuousPlayerAttributes, DiscretePlayerAttributes } from '@visactor/vrender-components';
import type { IData, IGroupMark, ITheme, IView, Nil, RecursivePartial } from '../types';
import type { IPlayer, PlayerFilterValue, PlayerSpec, PlayerType } from '../types/component';
import { Component } from '../view/component';
export declare const generateContinuousPlayerAttributes: (data: any[], theme?: ITheme, addition?: RecursivePartial<ContinuousPlayerAttributes>) => ContinuousPlayerAttributes;
export declare const generateDiscretePlayerAttributes: (data: any[], theme?: ITheme, addition?: RecursivePartial<DiscretePlayerAttributes>) => DiscretePlayerAttributes;
export declare class Player extends Component implements IPlayer {
    static readonly componentType: string;
    protected spec: PlayerSpec;
    protected _filterValue: PlayerFilterValue;
    private _playerComponentType;
    constructor(view: IView, group?: IGroupMark);
    protected parseAddition(spec: PlayerSpec): this;
    playerType(playerType: PlayerType): this;
    source(source: IData | string | any[] | Nil): this;
    play(): this;
    pause(): this;
    backward(): this;
    forward(): this;
    addGraphicItem(attrs: any, groupKey?: string, newGraphicItem?: any): any;
    protected _updateComponentEncoders(): void;
    private _getPlayerComponentType;
}
export declare const registerPlayer: () => void;
