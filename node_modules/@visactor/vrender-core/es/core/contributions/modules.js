import envModules from "./env/modules";

import textMeasureModules from "./textMeasure/modules";

import layerHandlerModules from "./layerHandler/modules";

export default function load(container) {
    container.load(envModules), container.load(textMeasureModules), container.load(layerHandlerModules);
}
//# sourceMappingURL=modules.js.map
