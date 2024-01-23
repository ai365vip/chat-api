import { AbstractComponent } from '../core/base';
import type { TitleAttrs } from './type';
import type { ComponentOptions } from '../interface';
export declare class Title extends AbstractComponent<Required<TitleAttrs>> {
    name: string;
    private _mainTitle?;
    private _subTitle?;
    static defaultAttributes: Partial<TitleAttrs>;
    constructor(attributes: TitleAttrs, options?: ComponentOptions);
    protected render(): void;
}
