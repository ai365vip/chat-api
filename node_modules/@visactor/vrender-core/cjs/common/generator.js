"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.Generator = void 0;

class Generator {
    static GenAutoIncrementId() {
        return Generator.auto_increment_id++;
    }
}

exports.Generator = Generator, Generator.auto_increment_id = 0;
//# sourceMappingURL=generator.js.map