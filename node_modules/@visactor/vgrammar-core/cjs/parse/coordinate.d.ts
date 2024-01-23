import type { CoordinateType, IPolarCoordinate, ICartesianCoordinate } from '@visactor/vgrammar-coordinate';
import { CartesianCoordinate, PolarCoordinate } from '@visactor/vgrammar-coordinate';
import type { IGrammarBase, IView } from '../types';
import type { CoordinateSpec } from '../types/coordinate';
export declare function createCoordinate(type: CoordinateType): CartesianCoordinate | PolarCoordinate;
export declare function parseCoordinate(spec: CoordinateSpec, view: IView): IGrammarBase[];
export declare function configureCoordinate(spec: CoordinateSpec, coordinate: IPolarCoordinate | ICartesianCoordinate, parameters: any): void;
