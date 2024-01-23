import type { IBaseCoordinate, CoordinateType } from '@visactor/vgrammar-coordinate';
import type { Nil } from '../types/base';
import type { GrammarType, ICoordinate, IGrammarBase, IView } from '../types';
import type { CoordinateFunctionType, CoordinateSpec } from '../types/coordinate';
import { GrammarBase } from './grammar-base';
export declare class Coordinate extends GrammarBase implements ICoordinate {
    readonly grammarType: GrammarType;
    protected spec: CoordinateSpec;
    private coordinate;
    constructor(view: IView, coordinateType: CoordinateType);
    parse(spec: CoordinateSpec): this;
    evaluate(upstream: any, parameters: any): this;
    output(): IBaseCoordinate;
    start(start: CoordinateFunctionType<[number, number]> | Nil): this;
    end(end: CoordinateFunctionType<[number, number]> | Nil): this;
    origin(origin: CoordinateFunctionType<[number, number]> | Nil): this;
    translate(offset: CoordinateFunctionType<[number, number]> | Nil): this;
    rotate(angle: CoordinateFunctionType<number> | Nil): this;
    scale(ratio: CoordinateFunctionType<[number, number]> | Nil): this;
    transpose(isTransposed: CoordinateFunctionType<boolean> | Nil): this;
    reuse(grammar: IGrammarBase): this;
    clear(): void;
}
export declare const registerCoordinate: () => void;
