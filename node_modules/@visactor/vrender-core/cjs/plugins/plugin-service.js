"use strict";

var __decorate = this && this.__decorate || function(decorators, target, key, desc) {
    var d, c = arguments.length, r = c < 3 ? target : null === desc ? desc = Object.getOwnPropertyDescriptor(target, key) : desc;
    if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) r = Reflect.decorate(decorators, target, key, desc); else for (var i = decorators.length - 1; i >= 0; i--) (d = decorators[i]) && (r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r);
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}, __metadata = this && this.__metadata || function(k, v) {
    if ("object" == typeof Reflect && "function" == typeof Reflect.metadata) return Reflect.metadata(k, v);
}, __param = this && this.__param || function(paramIndex, decorator) {
    return function(target, key) {
        decorator(target, key, paramIndex);
    };
};

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.DefaultPluginService = void 0;

const inversify_lite_1 = require("../common/inversify-lite"), contribution_provider_1 = require("../common/contribution-provider"), constants_1 = require("./constants"), container_1 = require("../container");

let DefaultPluginService = class {
    constructor(autoEnablePlugins) {
        this.autoEnablePlugins = autoEnablePlugins, this.onStartupFinishedPlugin = [], this.onRegisterPlugin = [], 
        this.actived = !1;
    }
    active(stage, params) {
        this.stage = stage, this.actived = !0;
        const {pluginList: pluginList} = params;
        pluginList && container_1.container.isBound(constants_1.AutoEnablePlugins) && this.autoEnablePlugins.getContributions().forEach((p => {
            pluginList.includes(p.name) && this.register(p);
        }));
    }
    findPluginsByName(name) {
        const arr = [];
        return this.onStartupFinishedPlugin.forEach((plugin => {
            plugin.name === name && arr.push(plugin);
        })), this.onRegisterPlugin.forEach((plugin => {
            plugin.name === name && arr.push(plugin);
        })), arr;
    }
    register(plugin) {
        "onStartupFinished" === plugin.activeEvent ? this.onStartupFinishedPlugin.push(plugin) : "onRegister" === plugin.activeEvent && (this.onRegisterPlugin.push(plugin), 
        plugin.activate(this));
    }
    unRegister(plugin) {
        "onStartupFinished" === plugin.activeEvent ? this.onStartupFinishedPlugin.splice(this.onStartupFinishedPlugin.indexOf(plugin), 1) : "onRegister" === plugin.activeEvent && this.onRegisterPlugin.splice(this.onStartupFinishedPlugin.indexOf(plugin), 1), 
        plugin.deactivate(this);
    }
    release(...params) {
        this.onStartupFinishedPlugin.forEach((plugin => {
            plugin.deactivate(this);
        })), this.onStartupFinishedPlugin = [], this.onRegisterPlugin.forEach((plugin => {
            plugin.deactivate(this);
        })), this.onRegisterPlugin = [];
    }
};

DefaultPluginService = __decorate([ (0, inversify_lite_1.injectable)(), __param(0, (0, 
inversify_lite_1.inject)(contribution_provider_1.ContributionProvider)), __param(0, (0, 
inversify_lite_1.named)(constants_1.AutoEnablePlugins)), __metadata("design:paramtypes", [ Object ]) ], DefaultPluginService), 
exports.DefaultPluginService = DefaultPluginService;
//# sourceMappingURL=plugin-service.js.map
