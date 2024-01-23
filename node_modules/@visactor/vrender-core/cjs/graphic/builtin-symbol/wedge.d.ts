import type { IContext2d, SymbolType, ISymbolClass } from '../../interface';
import { BaseSymbol } from './base';
export declare function wedge(ctx: IContext2d, r: number, transX: number, transY: number): boolean;
export declare class WedgeSymbol extends BaseSymbol implements ISymbolClass {
    type: SymbolType;
    pathStr: string;
    draw(ctx: IContext2d, size: number, transX: number, transY: number): boolean;
    drawOffset(ctx: IContext2d, size: number, transX: number, transY: number, offset: number): boolean;
}
declare const _default: WedgeSymbol;
export default _default;
