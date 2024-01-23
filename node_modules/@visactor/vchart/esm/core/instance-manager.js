import { array } from "@visactor/vutils";

export class InstanceManager {
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
        const excludeIdList = array(excludeId);
        return InstanceManager.instances.forEach(((instance, id, map) => {
            excludeIdList.includes(id) || callbackfn(instance, id, map);
        }), thisArg);
    }
}

InstanceManager.instances = new Map;
//# sourceMappingURL=instance-manager.js.map