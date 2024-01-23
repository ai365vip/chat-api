import { Config } from './core';
import { RoughCanvas } from './canvas';
import { RoughGenerator } from './generator';
import { RoughSVG } from './svg';
declare const _default: {
    canvas(canvas: HTMLCanvasElement, config?: Config | undefined): RoughCanvas;
    svg(svg: SVGSVGElement, config?: Config | undefined): RoughSVG;
    generator(config?: Config | undefined): RoughGenerator;
    newSeed(): number;
};
export default _default;
