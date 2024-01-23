"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
});

const inversify_lite_1 = require("../../../common/inversify-lite"), contribution_provider_1 = require("../../../common/contribution-provider"), textMeasure_contribution_1 = require("./textMeasure-contribution");

exports.default = new inversify_lite_1.ContainerModule((bind => {
    bind(textMeasure_contribution_1.TextMeasureContribution).to(textMeasure_contribution_1.DefaultTextMeasureContribution).inSingletonScope(), 
    (0, contribution_provider_1.bindContributionProvider)(bind, textMeasure_contribution_1.TextMeasureContribution);
}));
//# sourceMappingURL=modules.js.map
