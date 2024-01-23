import type { IView, IGrammarBase, Nil, IProjection, ProjectionSpec } from '@visactor/vgrammar-core';
import { GrammarBase } from '@visactor/vgrammar-core';
export declare function collectGeoJSON(data: any): any;
export declare function parseProjection(spec: ProjectionSpec, view: IView): IGrammarBase[];
export declare class Projection extends GrammarBase implements IProjection {
    readonly grammarType = "projection";
    private projection;
    constructor(view: IView);
    parse(spec: ProjectionSpec): this;
    pointRadius(pointRadius: ProjectionSpec['pointRadius']): this;
    size(data: ProjectionSpec['size']): this;
    extent(data: ProjectionSpec['extent']): this;
    fit(data: ProjectionSpec['fit']): this;
    configure(config: Omit<ProjectionSpec, 'fit' | 'extent' | 'size' | 'pointRadius'> | Nil): this;
    evaluate(upstream: any, parameters: any): any;
    output(): any;
}
