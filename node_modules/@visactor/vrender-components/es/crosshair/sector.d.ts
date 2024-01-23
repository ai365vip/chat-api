import type { IGroup } from '@visactor/vrender-core';
import type { PointLocationCfg } from '../core/type';
import { CrosshairBase } from './base';
import type { SectorCrosshairAttrs } from './type';
import type { ComponentOptions } from '../interface';
export declare class SectorCrosshair extends CrosshairBase<SectorCrosshairAttrs> {
    static defaultAttributes: {
        sectorStyle: {
            fill: string;
            opacity: number;
        };
    };
    constructor(attributes: SectorCrosshairAttrs, options?: ComponentOptions);
    protected renderCrosshair(container: IGroup): import("@visactor/vrender-core").INode;
    setLocation(point: PointLocationCfg): void;
}
