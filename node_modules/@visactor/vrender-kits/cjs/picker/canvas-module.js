"use strict";

var __importDefault = this && this.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : {
        default: mod
    };
};

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.loadCanvasPicker = exports.canvasPickerModule = void 0;

const vrender_core_1 = require("@visactor/vrender-core"), canvas_picker_service_1 = require("./canvas-picker-service"), module_1 = __importDefault(require("./contributions/canvas-picker/module"));

function loadCanvasPicker(c) {
    c.load(module_1.default), c.load(exports.canvasPickerModule);
}

exports.canvasPickerModule = new vrender_core_1.ContainerModule(((bind, unbind, isBound, rebind) => {
    isBound(canvas_picker_service_1.DefaultCanvasPickerService) || bind(canvas_picker_service_1.DefaultCanvasPickerService).toSelf().inSingletonScope(), 
    isBound(vrender_core_1.PickerService) ? rebind(vrender_core_1.PickerService).toService(canvas_picker_service_1.DefaultCanvasPickerService) : bind(vrender_core_1.PickerService).toService(canvas_picker_service_1.DefaultCanvasPickerService);
})), exports.loadCanvasPicker = loadCanvasPicker;
//# sourceMappingURL=canvas-module.js.map