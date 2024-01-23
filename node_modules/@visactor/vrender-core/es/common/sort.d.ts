import type { IGraphic } from '../interface';
export declare function foreach(graphic: IGraphic, defaultZIndex: number, cb: (...data: any) => boolean | void, reverse?: boolean, sort3d?: boolean): void;
export declare function foreachAsync(graphic: IGraphic, defaultZIndex: number, cb: (data: any, i: number) => boolean | void | Promise<boolean | void>, reverse?: boolean): Promise<void>;
export declare function findNextGraphic(graphic: IGraphic, id: number, defaultZIndex: number, reverse?: boolean): IGraphic<Partial<import("../interface").IGraphicAttribute>>;
