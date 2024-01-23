import type { IGroup } from '@visactor/vrender-core';
import { AbstractComponent } from '../core/base';
import type { LocationCfg } from '../core/type';
import type { BaseCrosshairAttrs } from './type';
export declare abstract class CrosshairBase<T extends BaseCrosshairAttrs> extends AbstractComponent<Required<T>> {
    name: string;
    protected abstract renderCrosshair(container: IGroup): any;
    abstract setLocation(location: LocationCfg): void;
    protected render(): void;
}
