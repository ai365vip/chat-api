import type { IContext2d, SymbolType, ISymbolClass } from '../../interface';
import { BaseSymbol } from './base';
export declare function circle(ctx: IContext2d, r: number, x: number, y: number, z?: number): boolean;
export declare class CircleSymbol extends BaseSymbol implements ISymbolClass {
    type: SymbolType;
    pathStr: string;
    draw(ctx: IContext2d, size: number, x: number, y: number, z?: number): boolean;
    drawOffset(ctx: IContext2d, size: number, x: number, y: number, offset: number, z?: number): boolean;
    drawToSvgPath(size: number, x: number, y: number, z?: number): string;
}
declare const _default: CircleSymbol;
export default _default;
