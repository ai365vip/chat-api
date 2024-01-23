"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
});

const inversify_lite_1 = require("../../../common/inversify-lite"), contribution_provider_1 = require("../../../common/contribution-provider"), constants_1 = require("../../../constants");

exports.default = new inversify_lite_1.ContainerModule((bind => {
    (0, contribution_provider_1.bindContributionProvider)(bind, constants_1.EnvContribution);
}));
//# sourceMappingURL=modules.js.map
