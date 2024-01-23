import type { IContext2d, ISymbolClass, SymbolType } from '../../interface';
import { BaseSymbol } from './base';
export declare function arrow(ctx: IContext2d, r: number, transX: number, transY: number): boolean;
export declare class ArrowSymbol extends BaseSymbol implements ISymbolClass {
    type: SymbolType;
    pathStr: string;
    draw(ctx: IContext2d, size: number, transX: number, transY: number): boolean;
    drawOffset(ctx: IContext2d, size: number, transX: number, transY: number, offset: number): boolean;
}
declare const _default: ArrowSymbol;
export default _default;
