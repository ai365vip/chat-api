import type { IContext2d, SymbolType, ISymbolClass } from '../../interface';
import { BaseSymbol } from './base';
export declare function diamond(ctx: IContext2d, r: number, x: number, y: number, z?: number): boolean;
export declare class DiamondSymbol extends BaseSymbol implements ISymbolClass {
    type: SymbolType;
    pathStr: string;
    draw(ctx: IContext2d, size: number, x: number, y: number, z?: number): boolean;
    drawFitDir(ctx: IContext2d, size: number, x: number, y: number, z?: number): boolean;
    drawOffset(ctx: IContext2d, size: number, x: number, y: number, offset: number, z?: number): boolean;
}
declare const _default: DiamondSymbol;
export default _default;
