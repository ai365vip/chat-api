import type { IGroup } from '@visactor/vrender-core';
import type { RegionLocationCfg } from '../core/type';
import type { Tag } from '../tag';
import { CrosshairBase } from './base';
import type { RectCrosshairAttrs } from './type';
import type { ComponentOptions } from '../interface';
export declare class RectCrosshair extends CrosshairBase<RectCrosshairAttrs> {
    static defaultAttributes: {
        rectStyle: {
            fill: string;
            opacity: number;
        };
    };
    protected topLabelShape?: Tag;
    protected bottomLabelShape?: Tag;
    protected leftLabelShape?: Tag;
    protected rightLabelShape?: Tag;
    constructor(attributes: RectCrosshairAttrs, options?: ComponentOptions);
    protected renderCrosshair(container: IGroup): import("@visactor/vrender-core").INode;
    setLocation(region: RegionLocationCfg): void;
}
