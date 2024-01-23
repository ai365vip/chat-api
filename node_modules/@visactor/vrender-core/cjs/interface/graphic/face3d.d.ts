import type { vec2, vec3 } from '../matrix';
export type IFace3d = {
    polygons: IPolygonItem[];
    edges: vec2[];
    vertices: vec3[];
};
export type IPolygonItem = {
    polygon: number[];
    normal: vec3;
    ave_z?: number;
};
