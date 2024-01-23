import type { IPointLike } from '@visactor/vutils';
import type { mat4, vec3 } from './matrix';
export type ViewParameters = {
    pos: vec3;
    center: vec3;
    up: vec3;
};
export type OrthoParameters = {
    left: number;
    right: number;
    top: number;
    bottom: number;
    fieldRatio: number;
    viewParams: ViewParameters;
    fieldDepth?: number;
};
export interface ICamera {
    params: OrthoParameters;
    getViewMatrix: () => mat4;
    getProjectionMatrix: () => mat4;
    vp: (x: number, y: number, z: number) => IPointLike;
    view: (x: number, y: number, z: number) => [number, number, number];
    getProjectionScale: (z: number) => number;
}
