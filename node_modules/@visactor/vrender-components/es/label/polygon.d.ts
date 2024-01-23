import type { IBoundsLike } from '@visactor/vutils';
import type { PolygonLabelAttrs } from './type';
import { LabelBase } from './base';
import type { ComponentOptions } from '../interface';
export declare class PolygonLabel extends LabelBase<PolygonLabelAttrs> {
    name: string;
    static defaultAttributes: Partial<PolygonLabelAttrs>;
    constructor(attributes: PolygonLabelAttrs, options?: ComponentOptions);
    protected labeling(textBounds: IBoundsLike, graphicBounds: IBoundsLike, position?: PolygonLabelAttrs['position'], offset?: number): {
        x: number;
        y: number;
    };
}
