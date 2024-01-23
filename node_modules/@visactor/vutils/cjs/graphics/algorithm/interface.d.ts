export interface Bound {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
}
export interface OBB {
    point1: Point;
    point2: Point;
    point3: Point;
    point4: Point;
    width: number;
    height: number;
    left: number;
    top: number;
}
export interface Point {
    x: number;
    y: number;
}
