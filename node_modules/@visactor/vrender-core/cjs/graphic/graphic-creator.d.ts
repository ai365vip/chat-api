import type { IArc, IArcGraphicAttribute, IArea, IAreaGraphicAttribute, ICircle, ICircleGraphicAttribute, IGroup, IGroupGraphicAttribute, IImage, IImageGraphicAttribute, ILine, ILineGraphicAttribute, IPath, IPathGraphicAttribute, IPolygon, IPolygonGraphicAttribute, IRect, IRect3d, IRect3dGraphicAttribute, IRectGraphicAttribute, IRichText, IRichTextGraphicAttribute, IShadowRoot, ISymbol, ISymbolGraphicAttribute, IText, ITextGraphicAttribute, IWrapTextGraphicAttribute } from '../interface';
declare class GraphicCreator {
    store: Map<string, any>;
    arc?: (attribute: IArcGraphicAttribute) => IArc;
    area?: (attribute: IAreaGraphicAttribute) => IArea;
    circle?: (attribute: ICircleGraphicAttribute) => ICircle;
    group?: (attribute: IGroupGraphicAttribute) => IGroup;
    image?: (attribute: IImageGraphicAttribute) => IImage;
    line?: (attribute: ILineGraphicAttribute) => ILine;
    path?: (attribute: IPathGraphicAttribute) => IPath;
    rect?: (attribute: IRectGraphicAttribute) => IRect;
    rect3d?: (attribute: IRect3dGraphicAttribute) => IRect3d;
    symbol?: (attribute: ISymbolGraphicAttribute) => ISymbol;
    text?: (attribute: ITextGraphicAttribute) => IText;
    richtext?: (attribute: IRichTextGraphicAttribute) => IRichText;
    polygon?: (attribute: IPolygonGraphicAttribute) => IPolygon;
    shadowRoot?: (attribute: IGroupGraphicAttribute) => IShadowRoot;
    wraptext?: (attribute: IWrapTextGraphicAttribute) => IText;
    constructor();
    RegisterGraphicCreator(name: string, cb: any): void;
    CreateGraphic(name: string, params: any): any;
}
export declare const graphicCreator: GraphicCreator;
export {};
