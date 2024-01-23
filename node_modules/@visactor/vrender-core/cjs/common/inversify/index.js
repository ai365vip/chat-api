"use strict";

var __createBinding = this && this.__createBinding || (Object.create ? function(o, m, k, k2) {
    void 0 === k2 && (k2 = k);
    var desc = Object.getOwnPropertyDescriptor(m, k);
    desc && !("get" in desc ? !m.__esModule : desc.writable || desc.configurable) || (desc = {
        enumerable: !0,
        get: function() {
            return m[k];
        }
    }), Object.defineProperty(o, k2, desc);
} : function(o, m, k, k2) {
    void 0 === k2 && (k2 = k), o[k2] = m[k];
}), __exportStar = this && this.__exportStar || function(m, exports) {
    for (var p in m) "default" === p || Object.prototype.hasOwnProperty.call(exports, p) || __createBinding(exports, m, p);
};

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.Container = exports.named = exports.injectable = exports.multiInject = exports.inject = exports.ContainerModule = void 0;

var cotainer_module_1 = require("./cotainer-module");

Object.defineProperty(exports, "ContainerModule", {
    enumerable: !0,
    get: function() {
        return cotainer_module_1.ContainerModule;
    }
});

var inject_1 = require("./annotation/inject");

Object.defineProperty(exports, "inject", {
    enumerable: !0,
    get: function() {
        return inject_1.inject;
    }
});

var multi_inject_1 = require("./annotation/multi_inject");

Object.defineProperty(exports, "multiInject", {
    enumerable: !0,
    get: function() {
        return multi_inject_1.multiInject;
    }
});

var injectable_1 = require("./annotation/injectable");

Object.defineProperty(exports, "injectable", {
    enumerable: !0,
    get: function() {
        return injectable_1.injectable;
    }
});

var named_1 = require("./annotation/named");

Object.defineProperty(exports, "named", {
    enumerable: !0,
    get: function() {
        return named_1.named;
    }
});

var container_1 = require("./container");

Object.defineProperty(exports, "Container", {
    enumerable: !0,
    get: function() {
        return container_1.Container;
    }
}), __exportStar(require("./interfaces"), exports);
//# sourceMappingURL=index.js.map
