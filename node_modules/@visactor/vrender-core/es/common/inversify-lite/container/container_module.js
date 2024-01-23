import { id } from "../utils/id";

export class ContainerModule {
    constructor(registry) {
        this.id = id(), this.registry = registry;
    }
}

export class AsyncContainerModule {
    constructor(registry) {
        this.id = id(), this.registry = registry;
    }
}
//# sourceMappingURL=container_module.js.map
