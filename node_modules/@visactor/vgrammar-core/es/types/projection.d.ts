import type { GrammarSpec, IGrammarBase } from './grammar';
import type { GenericFunctionType } from './signal';
import type { Nil } from './base';
export type GeoJsonFeatureSpec = any;
export type GeoJsonFeatureCollectionSpec = any;
export type FitSpec = GeoJsonFeatureSpec | GeoJsonFeatureCollectionSpec | GeoJsonFeatureSpec[];
export type ProjectionType = 'albers' | 'albersUsa' | 'azimuthalEqualArea' | 'azimuthalEquidistant' | 'conicConformal' | 'conicEqualArea' | 'conicEquidistant' | 'equalEarth' | 'equirectangular' | 'gnomonic' | 'identity' | 'mercator' | 'naturalEarth1' | 'orthographic' | 'stereographic' | 'transverseMercator';
export interface BaseProjectionSpec extends GrammarSpec {
    type: string;
    pointRadius?: ProjectionFunctionType<number>;
    extent?: ProjectionFunctionType<[[number, number], [number, number]]>;
    fit?: ProjectionFunctionType<FeatureCollectionData | FeatureCollectionData[] | FeatureData | FeatureData[] | GeometryData | GeometryData[]>;
    size?: ProjectionFunctionType<[number, number]>;
    clipAngle?: ProjectionFunctionType<number>;
    clipExtent?: ProjectionFunctionType<[number, number]>;
    scale?: ProjectionFunctionType<number>;
    translate?: ProjectionFunctionType<[number, number]>;
    center?: ProjectionFunctionType<[number, number]>;
    rotate?: ProjectionFunctionType<[number, number] | [number, number, number]>;
    parallels?: ProjectionFunctionType<[number, number]>;
    precision?: ProjectionFunctionType<number>;
    reflectX?: ProjectionFunctionType<boolean>;
    reflectY?: ProjectionFunctionType<number>;
    coefficient?: ProjectionFunctionType<number>;
    distance?: ProjectionFunctionType<number>;
    fraction?: ProjectionFunctionType<number>;
    lobes?: ProjectionFunctionType<number>;
    parallel?: ProjectionFunctionType<number>;
    radius?: ProjectionFunctionType<number>;
    ratio?: ProjectionFunctionType<number>;
    spacing?: ProjectionFunctionType<number>;
    tilt?: ProjectionFunctionType<number>;
}
export interface ProjectionSpec extends BaseProjectionSpec {
    name?: string;
}
export interface IProjection extends IGrammarBase {
    grammarType: 'projection';
    parse: (spec: ProjectionSpec) => this;
    pointRadius: (spec: ProjectionSpec['pointRadius']) => this;
    size: (spec: ProjectionSpec['size']) => this;
    fit: (spec: ProjectionSpec['fit']) => this;
    extent: (spec: ProjectionSpec['extent']) => this;
    configure: (spec: Omit<ProjectionSpec, 'fit' | 'extent' | 'size' | 'pointRadius'> | Nil) => this;
}
export interface GeometryData {
    type: 'Point' | 'MultiPoint' | 'LineString' | 'MultiLineString' | 'Polygon' | 'MultiPolygon' | 'GeometryCollection';
    coordinates?: [number, number] | [number, number][] | [number, number][][] | [number, number][][][];
    arcs?: number[][];
}
export interface FeatureData {
    type: 'Feature';
    geometry: GeometryData;
    properties?: Record<string, any>;
}
export interface FeatureCollectionData {
    type: 'FeatureCollection';
    features: FeatureData[];
}
export type ProjectionFunctionCallback<T> = (projection: any, parameters: any) => T;
export type ProjectionFunctionType<T> = GenericFunctionType<ProjectionFunctionCallback<T>, T>;
