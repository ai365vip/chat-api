import { ContainerModule } from "../../../common/inversify-lite";

import { bindContributionProvider } from "../../../common/contribution-provider";

import { DefaultTextMeasureContribution, TextMeasureContribution } from "./textMeasure-contribution";

export default new ContainerModule((bind => {
    bind(TextMeasureContribution).to(DefaultTextMeasureContribution).inSingletonScope(), 
    bindContributionProvider(bind, TextMeasureContribution);
}));
//# sourceMappingURL=modules.js.map
