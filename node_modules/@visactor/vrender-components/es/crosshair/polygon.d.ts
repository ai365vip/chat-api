import type { IGroup } from '@visactor/vrender-core';
import type { PointLocationCfg } from '../core/type';
import { CrosshairBase } from './base';
import type { PolygonCrosshairAttrs } from './type';
import type { ComponentOptions } from '../interface';
export declare class PolygonCrosshair extends CrosshairBase<PolygonCrosshairAttrs> {
    static defaultAttributes: {
        lineStyle: {
            stroke: string;
            lineWidth: number;
            lineDash: number[];
        };
    };
    constructor(attributes: PolygonCrosshairAttrs, options?: ComponentOptions);
    protected renderCrosshair(container: IGroup): import("@visactor/vrender-core").INode;
    setLocation(point: PointLocationCfg): void;
}
