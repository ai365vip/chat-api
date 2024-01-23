import { ScaleEnum } from './type';
import type { IBaseScale } from './interface';
export declare const implicit: unique symbol;
export declare class IdentityScale implements IBaseScale {
    readonly type = ScaleEnum.Identity;
    protected _domain: Array<any>;
    protected _unknown: any;
    protected _specified: Record<string, unknown>;
    specified(): Record<string, unknown>;
    specified(_: Record<string, unknown>): this;
    protected _getSpecifiedValue(input: string): undefined | any;
    clone(): IBaseScale;
    scale(d: any): any;
    invert(d: any): any;
    domain(): any[];
    domain(_: any[]): this;
    range(): any[];
    range(_: any[]): this;
    unknown(): any[];
    unknown(_: any): this;
}
