import coreModule from "./core/core-modules";

import renderModule from "./render/render-modules";

import pickModule from "./picker/pick-modules";

import graphicModule from "./graphic/graphic-service/graphic-module";

import pluginModule from "./plugins/plugin-modules";

import loadBuiltinContributions from "./core/contributions/modules";

import loadRenderContributions from "./render/contributions/modules";

import { LayerService } from "./core/constants";

import { application } from "./application";

import { GraphicService } from "./graphic/constants";

import { GraphicUtil, TransformUtil } from "./core/constants";

import { container } from "./container";

import { VGlobal } from "./constants";

export function preLoadAllModule() {
    preLoadAllModule.__loaded || (preLoadAllModule.__loaded = !0, container.load(coreModule), 
    container.load(graphicModule), container.load(renderModule), container.load(pickModule), 
    container.load(pluginModule), loadBuiltinContributions(container), loadRenderContributions(container));
}

preLoadAllModule.__loaded = !1, preLoadAllModule();

export const vglobal = container.get(VGlobal);

application.global = vglobal;

export const graphicUtil = container.get(GraphicUtil);

application.graphicUtil = graphicUtil;

export const transformUtil = container.get(TransformUtil);

application.transformUtil = transformUtil;

export const graphicService = container.get(GraphicService);

application.graphicService = graphicService;

export const layerService = container.get(LayerService);

application.layerService = layerService;
//# sourceMappingURL=modules.js.map