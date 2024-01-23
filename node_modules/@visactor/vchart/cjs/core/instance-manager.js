"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.InstanceManager = void 0;

const vutils_1 = require("@visactor/vutils");

class InstanceManager {
    static registerInstance(instance) {
        InstanceManager.instances.set(instance.id, instance);
    }
    static unregisterInstance(instance) {
        InstanceManager.instances.delete(instance.id);
    }
    static getInstance(id) {
        return InstanceManager.instances.get(id);
    }
    static instanceExist(id) {
        return InstanceManager.instances.has(id);
    }
    static forEach(callbackfn, excludeId = [], thisArg) {
        const excludeIdList = (0, vutils_1.array)(excludeId);
        return InstanceManager.instances.forEach(((instance, id, map) => {
            excludeIdList.includes(id) || callbackfn(instance, id, map);
        }), thisArg);
    }
}

exports.InstanceManager = InstanceManager, InstanceManager.instances = new Map;
//# sourceMappingURL=instance-manager.js.map