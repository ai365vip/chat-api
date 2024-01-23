import type { vec3 } from './matrix';
export interface IDirectionLight {
    dir: vec3;
    color: string;
    computeColor: (normal: vec3, color: string | vec3) => string;
}
