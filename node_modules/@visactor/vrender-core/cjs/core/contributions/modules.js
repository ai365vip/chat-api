"use strict";

var __importDefault = this && this.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : {
        default: mod
    };
};

Object.defineProperty(exports, "__esModule", {
    value: !0
});

const modules_1 = __importDefault(require("./env/modules")), modules_2 = __importDefault(require("./textMeasure/modules")), modules_3 = __importDefault(require("./layerHandler/modules"));

function load(container) {
    container.load(modules_1.default), container.load(modules_2.default), container.load(modules_3.default);
}

exports.default = load;
//# sourceMappingURL=modules.js.map
