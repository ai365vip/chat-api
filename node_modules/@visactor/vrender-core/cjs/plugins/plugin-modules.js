"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
});

const inversify_lite_1 = require("../common/inversify-lite"), constants_1 = require("./constants"), plugin_service_1 = require("./plugin-service"), contribution_provider_1 = require("../common/contribution-provider"), constants_2 = require("./constants");

exports.default = new inversify_lite_1.ContainerModule((bind => {
    bind(constants_1.PluginService).to(plugin_service_1.DefaultPluginService), (0, contribution_provider_1.bindContributionProviderNoSingletonScope)(bind, constants_2.AutoEnablePlugins);
}));
//# sourceMappingURL=plugin-modules.js.map
