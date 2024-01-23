"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.loadPoptip = exports.popTipModule = void 0;

const vrender_core_1 = require("@visactor/vrender-core"), contribution_1 = require("./contribution"), poptip_plugin_1 = require("./poptip-plugin");

function loadPoptip() {
    vrender_core_1.container.load(exports.popTipModule);
}

exports.popTipModule = new vrender_core_1.ContainerModule(((bind, unbind, isBound, rebind) => {
    isBound(contribution_1.PopTipRenderContribution) || (bind(contribution_1.PopTipRenderContribution).toSelf().inSingletonScope(), 
    bind(vrender_core_1.InteractiveSubRenderContribution).toService(contribution_1.PopTipRenderContribution)), 
    isBound(poptip_plugin_1.PopTipPlugin) || (bind(poptip_plugin_1.PopTipPlugin).toSelf(), 
    bind(vrender_core_1.AutoEnablePlugins).toService(poptip_plugin_1.PopTipPlugin)), 
    isBound(poptip_plugin_1.PopTipForClipedTextPlugin) || (bind(poptip_plugin_1.PopTipForClipedTextPlugin).toSelf(), 
    bind(vrender_core_1.AutoEnablePlugins).toService(poptip_plugin_1.PopTipForClipedTextPlugin));
})), exports.loadPoptip = loadPoptip;
//# sourceMappingURL=module.js.map
