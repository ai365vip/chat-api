import { ContainerModule, PickerService } from "@visactor/vrender-core";

import { DefaultCanvasPickerService } from "./canvas-picker-service";

import canvasModule from "./contributions/canvas-picker/module";

export const canvasPickerModule = new ContainerModule(((bind, unbind, isBound, rebind) => {
    isBound(DefaultCanvasPickerService) || bind(DefaultCanvasPickerService).toSelf().inSingletonScope(), 
    isBound(PickerService) ? rebind(PickerService).toService(DefaultCanvasPickerService) : bind(PickerService).toService(DefaultCanvasPickerService);
}));

export function loadCanvasPicker(c) {
    c.load(canvasModule), c.load(canvasPickerModule);
}
//# sourceMappingURL=canvas-module.js.map