import type { Point } from '../../core/type';
export interface LineAxisMixin {
    attribute: {
        start: Point;
        end: Point;
        verticalFactor?: number;
    };
}
export declare class LineAxisMixin {
    isInValidValue(value: number): boolean;
    getTickCoord(tickValue: number): Point;
    getRelativeVector(point?: Point): [number, number];
    getVerticalVector(offset: number, inside: boolean, point: Point): [number, number];
}
