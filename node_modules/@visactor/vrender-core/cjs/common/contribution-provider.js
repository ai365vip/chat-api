"use strict";

Object.defineProperty(exports, "__esModule", {
    value: !0
}), exports.bindContributionProviderNoSingletonScope = exports.bindContributionProvider = exports.ContributionProvider = void 0, 
exports.ContributionProvider = Symbol("ContributionProvider");

class ContributionProviderCache {
    constructor(serviceIdentifier, container) {
        this.serviceIdentifier = serviceIdentifier, this.container = container;
    }
    getContributions() {
        return this.caches || (this.caches = [], this.container && this.container.isBound(this.serviceIdentifier) && this.caches.push(...this.container.getAll(this.serviceIdentifier))), 
        this.caches;
    }
}

function bindContributionProvider(bind, id) {
    bind(exports.ContributionProvider).toDynamicValue((({container: container}) => new ContributionProviderCache(id, container))).inSingletonScope().whenTargetNamed(id);
}

function bindContributionProviderNoSingletonScope(bind, id) {
    bind(exports.ContributionProvider).toDynamicValue((({container: container}) => new ContributionProviderCache(id, container))).whenTargetNamed(id);
}

exports.bindContributionProvider = bindContributionProvider, exports.bindContributionProviderNoSingletonScope = bindContributionProviderNoSingletonScope;
//# sourceMappingURL=contribution-provider.js.map