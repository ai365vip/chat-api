import type { IGraphicAttribute, IGraphic } from '../graphic';
import type { ICustomPath2D } from '../path';
export type IGlyphAttribute = {
    path: string | ICustomPath2D;
    width: number;
    height: number;
    cornerRadius: number | number[];
    clip: boolean;
};
export type IGlyphGraphicAttribute = Partial<IGraphicAttribute> & Partial<IGlyphAttribute>;
export interface IGlyph<T extends Partial<IGraphicAttribute> = Partial<IGraphicAttribute>> extends IGraphic<IGlyphGraphicAttribute> {
    glyphStates?: Record<string, {
        attributes: IGlyphGraphicAttribute;
        subAttributes: T[];
    }>;
    glyphStateProxy?: (stateName: string, targetStates?: string[]) => {
        attributes: IGlyphGraphicAttribute;
        subAttributes: T[];
    };
    setSubGraphic: (subGraphic: IGraphic[]) => void;
    getSubGraphic: () => IGraphic[];
    onInit: (cb: (g: this) => void) => void;
    onUpdate: (cb: (g: this) => void) => void;
}
