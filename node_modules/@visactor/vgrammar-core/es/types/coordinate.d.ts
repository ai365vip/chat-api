import type { IBaseCoordinate, CoordinateType } from '@visactor/vgrammar-coordinate';
import type { GrammarSpec } from './grammar';
import type { GenericFunctionType } from './signal';
export type CoordinateFunctionCallback<T> = (scale: IBaseCoordinate, parameters: any) => T;
export type CoordinateFunctionType<T> = GenericFunctionType<CoordinateFunctionCallback<T>, T>;
export interface CoordinateSpec extends GrammarSpec {
    type: CoordinateType;
    start?: CoordinateFunctionType<[number, number]>;
    end?: CoordinateFunctionType<[number, number]>;
    origin?: CoordinateFunctionType<[number, number]>;
    translate?: CoordinateFunctionType<[number, number]>;
    rotate?: CoordinateFunctionType<number>;
    scale?: CoordinateFunctionType<[number, number]>;
    transpose?: CoordinateFunctionType<boolean>;
}
