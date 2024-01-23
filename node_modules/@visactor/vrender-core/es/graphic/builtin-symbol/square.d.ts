import type { IContext2d, SymbolType, ISymbolClass } from '../../interface';
import { BaseSymbol } from './base';
export declare function square(ctx: IContext2d, r: number, x: number, y: number): boolean;
export declare class SquareSymbol extends BaseSymbol implements ISymbolClass {
    type: SymbolType;
    pathStr: string;
    draw(ctx: IContext2d, size: number, x: number, y: number): boolean;
    drawOffset(ctx: IContext2d, size: number, x: number, y: number, offset: number): boolean;
}
declare const _default: SquareSymbol;
export default _default;
