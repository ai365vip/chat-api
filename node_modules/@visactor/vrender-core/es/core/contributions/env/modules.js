import { ContainerModule } from "../../../common/inversify-lite";

import { bindContributionProvider } from "../../../common/contribution-provider";

import { EnvContribution } from "../../../constants";

export default new ContainerModule((bind => {
    bindContributionProvider(bind, EnvContribution);
}));
//# sourceMappingURL=modules.js.map
