import type { IGraphic, IGraphicRender, IRenderService } from '../../../interface';
export declare abstract class AbstractGraphicRender implements IGraphicRender {
    type: string;
    numberType: number;
    abstract draw(graphic: IGraphic, renderService: IRenderService): void;
}
