import { ContainerModule } from "../common/inversify-lite";

import { PluginService } from "./constants";

import { DefaultPluginService } from "./plugin-service";

import { bindContributionProviderNoSingletonScope } from "../common/contribution-provider";

import { AutoEnablePlugins } from "./constants";

export default new ContainerModule((bind => {
    bind(PluginService).to(DefaultPluginService), bindContributionProviderNoSingletonScope(bind, AutoEnablePlugins);
}));
//# sourceMappingURL=plugin-modules.js.map
