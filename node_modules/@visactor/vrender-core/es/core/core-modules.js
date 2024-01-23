import { ContainerModule } from "../common/inversify-lite";

import { DefaultGlobal } from "./global";

import { DefaultGraphicUtil, DefaultTransformUtil } from "./graphic-utils";

import { DefaultLayerService } from "./layer-service";

import { DefaultWindow, VWindow } from "./window";

import { GraphicUtil, LayerService, TransformUtil } from "./constants";

import { VGlobal } from "../constants";

export default new ContainerModule((bind => {
    bind(VGlobal).to(DefaultGlobal).inSingletonScope(), bind(VWindow).to(DefaultWindow), 
    bind(GraphicUtil).to(DefaultGraphicUtil).inSingletonScope(), bind(TransformUtil).to(DefaultTransformUtil).inSingletonScope(), 
    bind(LayerService).to(DefaultLayerService).inSingletonScope();
}));
//# sourceMappingURL=core-modules.js.map
