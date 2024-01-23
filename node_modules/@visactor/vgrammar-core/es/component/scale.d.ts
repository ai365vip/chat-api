import type { IScale, Nil } from '../types';
import type { IScaleComponent, ScaleComponentSpec } from '../types/component';
import { Component } from '../view/component';
export declare abstract class ScaleComponent extends Component implements IScaleComponent {
    protected spec: ScaleComponentSpec;
    protected parseAddition(spec: ScaleComponentSpec): this;
    scale(scale?: IScale | string | Nil): this;
    getScale(): IScale;
}
