var __decorate = this && this.__decorate || function(decorators, target, key, desc) {
    var d, c = arguments.length, r = c < 3 ? target : null === desc ? desc = Object.getOwnPropertyDescriptor(target, key) : desc;
    if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) r = Reflect.decorate(decorators, target, key, desc); else for (var i = decorators.length - 1; i >= 0; i--) (d = decorators[i]) && (r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r);
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}, __metadata = this && this.__metadata || function(k, v) {
    if ("object" == typeof Reflect && "function" == typeof Reflect.metadata) return Reflect.metadata(k, v);
};

import { injectable } from "../../../common/inversify-lite";

import { application } from "../../../application";

let EmptyLayerHandlerContribution = class {
    constructor() {
        this.offscreen = !1, this.type = "virtual", this.global = application.global;
    }
    setDpr(dpr) {}
    init(layer, window, params) {
        if (this.layer = layer, this.window = window, params.main) throw new Error("virtual layer不能作为main layer");
        this.main = !1, this.canvas = null, this.context = null;
    }
    resize(w, h) {}
    resizeView(w, h) {}
    render(group, params, userParams) {
        this.mainHandler.render(group, params, Object.assign(Object.assign({}, userParams), {
            clear: !1
        }));
    }
    merge(layerHandlers) {}
    prepare(dirtyBounds, params) {}
    drawTo(target, group, params) {
        var _a;
        const context = target.getContext();
        params.renderService.render(group, Object.assign(Object.assign({
            context: context
        }, params), {
            clear: params.clear ? null !== (_a = params.background) && void 0 !== _a ? _a : "#fff" : void 0
        }));
    }
    getContext() {
        return null;
    }
    release() {}
};

EmptyLayerHandlerContribution = __decorate([ injectable(), __metadata("design:paramtypes", []) ], EmptyLayerHandlerContribution);

export { EmptyLayerHandlerContribution };
//# sourceMappingURL=empty-contribution.js.map
