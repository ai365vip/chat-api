import type { IGroup } from '@visactor/vrender-core';
import type { RegionLocationCfg } from '../core/type';
import { CrosshairBase } from './base';
import type { LineCrosshairAttrs } from './type';
import type { ComponentOptions } from '../interface';
export declare class LineCrosshair extends CrosshairBase<LineCrosshairAttrs> {
    static defaultAttributes: {
        lineStyle: {
            stroke: string;
            lineWidth: number;
            lineDash: number[];
        };
    };
    constructor(attributes: LineCrosshairAttrs, options?: ComponentOptions);
    protected renderCrosshair(container: IGroup): import("@visactor/vrender-core").INode;
    setLocation(region: RegionLocationCfg): void;
}
