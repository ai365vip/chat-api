"use strict";

var __importDefault = this && this.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : {
        default: mod
    };
};

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.layerService = exports.graphicService = exports.transformUtil = exports.graphicUtil = exports.vglobal = exports.preLoadAllModule = void 0;

const core_modules_1 = __importDefault(require("./core/core-modules")), render_modules_1 = __importDefault(require("./render/render-modules")), pick_modules_1 = __importDefault(require("./picker/pick-modules")), graphic_module_1 = __importDefault(require("./graphic/graphic-service/graphic-module")), plugin_modules_1 = __importDefault(require("./plugins/plugin-modules")), modules_1 = __importDefault(require("./core/contributions/modules")), modules_2 = __importDefault(require("./render/contributions/modules")), constants_1 = require("./core/constants"), application_1 = require("./application"), constants_2 = require("./graphic/constants"), constants_3 = require("./core/constants"), container_1 = require("./container"), constants_4 = require("./constants");

function preLoadAllModule() {
    preLoadAllModule.__loaded || (preLoadAllModule.__loaded = !0, container_1.container.load(core_modules_1.default), 
    container_1.container.load(graphic_module_1.default), container_1.container.load(render_modules_1.default), 
    container_1.container.load(pick_modules_1.default), container_1.container.load(plugin_modules_1.default), 
    (0, modules_1.default)(container_1.container), (0, modules_2.default)(container_1.container));
}

exports.preLoadAllModule = preLoadAllModule, preLoadAllModule.__loaded = !1, preLoadAllModule(), 
exports.vglobal = container_1.container.get(constants_4.VGlobal), application_1.application.global = exports.vglobal, 
exports.graphicUtil = container_1.container.get(constants_3.GraphicUtil), application_1.application.graphicUtil = exports.graphicUtil, 
exports.transformUtil = container_1.container.get(constants_3.TransformUtil), application_1.application.transformUtil = exports.transformUtil, 
exports.graphicService = container_1.container.get(constants_2.GraphicService), 
application_1.application.graphicService = exports.graphicService, exports.layerService = container_1.container.get(constants_1.LayerService), 
application_1.application.layerService = exports.layerService;
//# sourceMappingURL=modules.js.map