import { ContainerModule } from "../../common/inversify-lite";

import { DefaultGraphicService } from "./graphic-service";

import { GraphicCreator, GraphicService } from "../constants";

import { graphicCreator } from "../graphic-creator";

export default new ContainerModule((bind => {
    bind(GraphicService).to(DefaultGraphicService).inSingletonScope(), bind(GraphicCreator).toConstantValue(graphicCreator);
}));
//# sourceMappingURL=graphic-module.js.map
