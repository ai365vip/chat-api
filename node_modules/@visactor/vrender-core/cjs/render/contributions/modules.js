"use strict";

var __importDefault = this && this.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : {
        default: mod
    };
};

Object.defineProperty(exports, "__esModule", {
    value: !0
});

const module_1 = __importDefault(require("./render/module"));

function load(container) {
    container.load(module_1.default);
}

exports.default = load;
//# sourceMappingURL=modules.js.map
