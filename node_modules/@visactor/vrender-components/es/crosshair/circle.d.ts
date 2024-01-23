import type { IGroup } from '@visactor/vrender-core';
import type { PointLocationCfg } from '../core/type';
import { CrosshairBase } from './base';
import type { CircleCrosshairAttrs } from './type';
import type { ComponentOptions } from '../interface';
export declare class CircleCrosshair extends CrosshairBase<CircleCrosshairAttrs> {
    static defaultAttributes: {
        lineStyle: {
            stroke: (string | boolean)[];
            lineWidth: number;
            lineDash: number[];
        };
    };
    constructor(attributes: CircleCrosshairAttrs, options?: ComponentOptions);
    protected renderCrosshair(container: IGroup): import("@visactor/vrender-core").INode;
    setLocation(point: PointLocationCfg): void;
}
