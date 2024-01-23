import type { ILineGraphicAttribute, IGroupGraphicAttribute } from '@visactor/vrender-core';
import type { Point } from '../../core/type';
import type { AxisItem, callbackFunc } from '../type';
export type SubGridAttributesForAxis = {
    visible?: boolean;
    count?: number;
} & Pick<GridBaseAttributes, 'alternateColor' | 'style' | 'zIndex'>;
export interface IGrid3dType {
    beta: number;
    anchor3d?: [number, number];
}
export type GridItem = {
    id?: string | number;
    points: Point[];
    [key: string]: any;
};
export type GridBaseAttributes = {
    type?: 'circle' | 'polygon' | 'line';
    visible?: boolean;
    items: AxisItem[];
    closed?: boolean;
    style?: ILineGraphicAttribute | callbackFunc<Partial<ILineGraphicAttribute> | undefined>;
    alternateColor?: string | string[];
    zIndex?: number;
    alignWithLabel?: boolean;
    subGrid?: SubGridAttributesForAxis;
    verticalFactor?: number;
} & IGroupGraphicAttribute;
export type LineGridAttributes = {
    smoothLink?: boolean;
    center?: Point;
    depth?: number;
} & GridBaseAttributes;
export type PolygonGridAttributes = {
    type: 'polygon';
} & GridBaseAttributes;
export type CircleGridAttributes = {
    type: 'circle';
    center: Point;
} & GridBaseAttributes;
export type GridAttributes = LineGridAttributes | CircleGridAttributes | PolygonGridAttributes;
export type LineGridOfLineAxisAttributes = LineGridAttributes & {
    type: 'line';
    length: number;
};
export type PolarGridOfLineAxisAttributes = (PolygonGridAttributes | CircleGridAttributes) & {
    center?: Point;
    sides?: number;
    startAngle?: number;
    endAngle?: number;
};
export type LineAxisGridAttributes = (LineGridOfLineAxisAttributes | PolarGridOfLineAxisAttributes) & {
    start: Point;
    end: Point;
};
export type CircleAxisGridAttributes = LineGridAttributes & {
    inside?: boolean;
    center: Point;
    startAngle?: number;
    endAngle?: number;
    radius: number;
    innerRadius?: number;
};
