import type { IBounds } from '@visactor/vutils';
import type { IGroup, IGraphic, IRenderService, IRenderServiceDrawParams, IDrawContribution } from '../interface';
export declare const RenderService: unique symbol;
export declare const BeforeRenderConstribution: unique symbol;
export declare class DefaultRenderService implements IRenderService {
    private readonly drawContribution;
    dirtyBounds: IBounds;
    renderTreeRoots: IGraphic[];
    renderLists: IGraphic[];
    drawParams: IRenderServiceDrawParams;
    constructor(drawContribution: IDrawContribution);
    prepare(updateBounds: boolean): void;
    protected _prepare(g: IGraphic, updateBounds: boolean): void;
    prepareRenderList(): void;
    beforeDraw(params: IRenderServiceDrawParams): void;
    draw(params: IRenderServiceDrawParams): void;
    afterDraw(params: IRenderServiceDrawParams): void;
    render(groups: IGroup[], params: IRenderServiceDrawParams): void;
}
