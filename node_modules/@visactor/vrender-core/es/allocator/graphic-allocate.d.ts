import type { IAllocate } from '../interface';
import type { IArc, IArcGraphicAttribute, IArea, IAreaGraphicAttribute, ICircle, ICircleGraphicAttribute, IGraphic, ILine, ILineGraphicAttribute, IPath, IPathGraphicAttribute, IRect, IRectGraphicAttribute, ISymbol, ISymbolGraphicAttribute, IText, ITextGraphicAttribute, Releaseable } from '../interface';
export declare abstract class DefaultGraphicAllocate<T extends IGraphic, IGraphicAttribute> implements IAllocate<T>, Releaseable {
    protected pools: T[];
    abstract allocate(attribute: IGraphicAttribute): T;
    abstract allocateByObj(g: T): T;
    free(d: T): void;
    get length(): number;
    release(...params: any): void;
}
export declare class DefaultRectAllocate extends DefaultGraphicAllocate<IRect, IRectGraphicAttribute> {
    allocate(attribute: IRectGraphicAttribute): IRect;
    allocateByObj(rect: IRect): IRect;
}
export declare const defaultRectAllocate: DefaultRectAllocate;
export declare class DefaultArcAllocate extends DefaultGraphicAllocate<IArc, IArcGraphicAttribute> {
    allocate(attribute: IArcGraphicAttribute): IArc;
    allocateByObj(arc: IArc): IArc;
}
export declare const defaultArcAllocate: DefaultArcAllocate;
export declare class DefaultAreaAllocate extends DefaultGraphicAllocate<IArea, IAreaGraphicAttribute> {
    allocate(attribute: IAreaGraphicAttribute): IArea;
    allocateByObj(area: IArea): IArea;
}
export declare const defaultAreaAllocate: DefaultAreaAllocate;
export declare class DefaultCircleAllocate extends DefaultGraphicAllocate<ICircle, ICircleGraphicAttribute> {
    allocate(attribute: ICircleGraphicAttribute): ICircle;
    allocateByObj(area: ICircle): ICircle;
}
export declare const defaultCircleAllocate: DefaultCircleAllocate;
export declare class DefaultLineAllocate extends DefaultGraphicAllocate<ILine, ILineGraphicAttribute> {
    allocate(attribute: ILineGraphicAttribute): ILine;
    allocateByObj(line: ILine): ILine;
}
export declare const defaultLineAllocate: DefaultLineAllocate;
export declare class DefaultPathAllocate extends DefaultGraphicAllocate<IPath, IPathGraphicAttribute> {
    allocate(attribute: IPathGraphicAttribute): IPath;
    allocateByObj(path: IPath): IPath;
}
export declare const defaultPathAllocate: DefaultPathAllocate;
export declare class DefaultSymbolAllocate extends DefaultGraphicAllocate<ISymbol, ISymbolGraphicAttribute> {
    allocate(attribute: ISymbolGraphicAttribute): ISymbol;
    allocateByObj(symbol: ISymbol): ISymbol;
}
export declare const defaultSymbolAllocate: DefaultSymbolAllocate;
export declare class DefaultTextAllocate extends DefaultGraphicAllocate<IText, ITextGraphicAttribute> {
    allocate(attribute: ITextGraphicAttribute): IText;
    allocateByObj(text: IText): IText;
}
export declare const defaultTextAllocate: DefaultTextAllocate;
export declare class DefaultGraphicMemoryManager {
    map: Record<string, DefaultGraphicAllocate<any, any>>;
    gc(g: IGraphic): void;
    gcItem(g: IGraphic): void;
}
export declare const defaultGraphicMemoryManager: DefaultGraphicMemoryManager;
