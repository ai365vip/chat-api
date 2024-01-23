import { AbstractComponent } from '../core/base';
import type { LinkPathAttributes } from './type';
import type { ComponentOptions } from '../interface';
export declare const getHorizontalPath: (options: LinkPathAttributes, ratio?: number) => string;
export declare const getVerticalPath: (options: LinkPathAttributes, ratio?: number) => string;
export declare class LinkPath extends AbstractComponent<Required<LinkPathAttributes>> {
    static defaultAttributes: {
        direction: string;
        align: string;
    };
    private _container;
    private _backPath?;
    private _frontPath?;
    constructor(attributes: LinkPathAttributes, options?: ComponentOptions);
    protected render(): void;
}
