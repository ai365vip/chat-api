"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.ContainerModule = void 0;

const generator_1 = require("../generator");

class ContainerModule {
    constructor(registry) {
        this.id = generator_1.Generator.GenAutoIncrementId(), this.registry = registry;
    }
}

exports.ContainerModule = ContainerModule;
//# sourceMappingURL=cotainer-module.js.map
