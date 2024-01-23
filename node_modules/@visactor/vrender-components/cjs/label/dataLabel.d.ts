import { AbstractComponent } from '../core/base';
import type { PointLocationCfg } from '../core/type';
import type { DataLabelAttrs } from './type';
import type { ComponentOptions } from '../interface';
export declare class DataLabel extends AbstractComponent<DataLabelAttrs> {
    name: string;
    private _componentMap;
    private static defaultAttributes;
    constructor(attributes: DataLabelAttrs, options?: ComponentOptions);
    protected render(): void;
    setLocation(point: PointLocationCfg): void;
    disableAnimation(): void;
    enableAnimation(): void;
}
