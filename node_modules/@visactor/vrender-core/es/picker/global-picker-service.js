var __decorate = this && this.__decorate || function(decorators, target, key, desc) {
    var d, c = arguments.length, r = c < 3 ? target : null === desc ? desc = Object.getOwnPropertyDescriptor(target, key) : desc;
    if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) r = Reflect.decorate(decorators, target, key, desc); else for (var i = decorators.length - 1; i >= 0; i--) (d = decorators[i]) && (r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r);
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}, __metadata = this && this.__metadata || function(k, v) {
    if ("object" == typeof Reflect && "function" == typeof Reflect.metadata) return Reflect.metadata(k, v);
};

import { Matrix, Point } from "@visactor/vutils";

import { injectable } from "../common/inversify-lite";

import { application } from "../application";

let DefaultGlobalPickerService = class {
    constructor() {
        this.global = application.global, this.global.hooks.onSetEnv.tap("global-picker-service", ((lastEnv, env, global) => {
            this.configure(global, env);
        })), this.configure(this.global, this.global.env);
    }
    configure(global, env) {}
    pick(graphics, point, params) {
        let result = {
            graphic: null,
            group: null
        };
        const parentMatrix = new Matrix(1, 0, 0, 1, 0, 0);
        let group;
        for (let i = 0; i < graphics.length; i++) {
            if (graphics[i].isContainer) result = this.pickGroup(graphics[i], point, parentMatrix, params); else {
                const data = this.pickItem(graphics[i], point, parentMatrix, params);
                data && (result.graphic = data.graphic, result.params = data.params);
            }
            if (result.graphic) break;
            group || (group = result.group);
        }
        if (result.graphic || (result.group = group), result.graphic) {
            let g = result.graphic;
            for (;g.parent; ) g = g.parent;
            g.shadowHost && (result.params = {
                shadowTarget: result.graphic
            }, result.graphic = g.shadowHost);
        }
        return result;
    }
    containsPoint(graphic, point, params) {
        return !!this.pickItem(graphic, point, null, params);
    }
    pickGroup(group, point, parentMatrix, params) {
        let result = {
            group: null,
            graphic: null
        };
        if (!1 === group.attribute.visibleAll) return result;
        const transMatrix = group.transMatrix, newPoint = new Point(point.x, point.y);
        parentMatrix.transformPoint(newPoint, newPoint);
        const insideGroup = group.AABBBounds.containsPoint(newPoint);
        if (!insideGroup) return result;
        const groupPicked = !1 !== group.attribute.pickable && insideGroup;
        return parentMatrix.multiply(transMatrix.a, transMatrix.b, transMatrix.c, transMatrix.d, transMatrix.e, transMatrix.f), 
        !1 !== group.attribute.childrenPickable && group.forEachChildren((graphic => {
            if (graphic.isContainer) result = this.pickGroup(graphic, point, parentMatrix, params); else {
                const newPoint = new Point(point.x, point.y);
                parentMatrix.transformPoint(newPoint, newPoint);
                const data = this.pickItem(graphic, newPoint, parentMatrix, params);
                data && (result.graphic = data.graphic, result.params = data.params);
            }
            return !!result.graphic || !!result.group;
        })), result.graphic || result.group || !groupPicked || (result.group = group), result;
    }
    pickItem(graphic, point, parentMatrix, params) {
        return !1 === graphic.attribute.pickable ? null : graphic.AABBBounds.containsPoint(point) ? {
            graphic: graphic
        } : null;
    }
};

DefaultGlobalPickerService = __decorate([ injectable(), __metadata("design:paramtypes", []) ], DefaultGlobalPickerService);

export { DefaultGlobalPickerService };
//# sourceMappingURL=global-picker-service.js.map
