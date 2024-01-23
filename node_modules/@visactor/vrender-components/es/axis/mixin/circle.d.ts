import type { Point } from '../../core/type';
export interface CircleAxisMixin {
    attribute: {
        inside?: boolean;
        center: Point;
        startAngle?: number;
        endAngle?: number;
        radius: number;
        innerRadius?: number;
    };
}
export declare class CircleAxisMixin {
    isInValidValue(value: number): boolean;
    getTickCoord(tickValue: number): Point;
    getVerticalVector(offset: number, inside: boolean, point: Point): [number, number];
    getRelativeVector(point?: Point): [number, number];
}
