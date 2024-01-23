import { AutoEnablePlugins, ContainerModule, container } from "@visactor/vrender-core";

import { ScrollBarPlugin } from "./scrollbar-plugin";

export const scrollbarModule = new ContainerModule(((bind, unbind, isBound, rebind) => {
    isBound(ScrollBarPlugin) || (bind(ScrollBarPlugin).toSelf(), bind(AutoEnablePlugins).toService(ScrollBarPlugin));
}));

export function loadScrollbar() {
    container.load(scrollbarModule);
}
//# sourceMappingURL=module.js.map
