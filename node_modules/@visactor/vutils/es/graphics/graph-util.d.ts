interface ITextConfig {
    text: string;
    fontSize: number;
    fontStyle?: string;
    fontVariant?: string;
    fontWeight?: number | string;
    fontFamily?: string;
}
export declare class GraphicUtil {
    canvas?: HTMLCanvasElement;
    ctx?: CanvasRenderingContext2D | null;
    static instance?: GraphicUtil;
    constructor(canvas?: HTMLCanvasElement);
    setCanvas(canvas?: HTMLCanvasElement): void;
    measureText(tc: ITextConfig): {
        width: number;
        height: number;
    };
    private measureTextByCanvas;
    private estimate;
    static getDefaultUtils(canvas?: HTMLCanvasElement): GraphicUtil;
}
export {};
