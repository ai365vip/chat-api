import type { IContext2d, SymbolType, ISymbolClass } from '../../interface';
import { BaseSymbol } from './base';
export declare function cross(ctx: IContext2d, r: number, x: number, y: number, z?: number): boolean;
export declare function crossOffset(ctx: IContext2d, r: number, x: number, y: number, offset: number, z?: number): boolean;
export declare class CrossSymbol extends BaseSymbol implements ISymbolClass {
    type: SymbolType;
    pathStr: string;
    draw(ctx: IContext2d, size: number, x: number, y: number, z?: number): boolean;
    drawOffset(ctx: IContext2d, size: number, x: number, y: number, offset: number, z?: number): boolean;
}
declare const _default: CrossSymbol;
export default _default;
