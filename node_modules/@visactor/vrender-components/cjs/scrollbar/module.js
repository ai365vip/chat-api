"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.loadScrollbar = exports.scrollbarModule = void 0;

const vrender_core_1 = require("@visactor/vrender-core"), scrollbar_plugin_1 = require("./scrollbar-plugin");

function loadScrollbar() {
    vrender_core_1.container.load(exports.scrollbarModule);
}

exports.scrollbarModule = new vrender_core_1.ContainerModule(((bind, unbind, isBound, rebind) => {
    isBound(scrollbar_plugin_1.ScrollBarPlugin) || (bind(scrollbar_plugin_1.ScrollBarPlugin).toSelf(), 
    bind(vrender_core_1.AutoEnablePlugins).toService(scrollbar_plugin_1.ScrollBarPlugin));
})), exports.loadScrollbar = loadScrollbar;
//# sourceMappingURL=module.js.map
