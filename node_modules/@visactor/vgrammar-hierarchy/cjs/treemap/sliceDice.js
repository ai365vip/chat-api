"use strict";

var __importDefault = this && this.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : {
        default: mod
    };
};

Object.defineProperty(exports, "__esModule", {
    value: !0
});

const dice_1 = __importDefault(require("./dice")), slice_1 = __importDefault(require("./slice"));

function default_1(parent, x0, y0, x1, y1) {
    (parent.depth % 2 == 1 ? slice_1.default : dice_1.default)(parent, x0, y0, x1, y1);
}

exports.default = default_1;
//# sourceMappingURL=sliceDice.js.map