export const ContributionProvider = Symbol("ContributionProvider");

class ContributionProviderCache {
    constructor(serviceIdentifier, container) {
        this.serviceIdentifier = serviceIdentifier, this.container = container;
    }
    getContributions() {
        return this.caches || (this.caches = [], this.container && this.container.isBound(this.serviceIdentifier) && this.caches.push(...this.container.getAll(this.serviceIdentifier))), 
        this.caches;
    }
}

export function bindContributionProvider(bind, id) {
    bind(ContributionProvider).toDynamicValue((({container: container}) => new ContributionProviderCache(id, container))).inSingletonScope().whenTargetNamed(id);
}

export function bindContributionProviderNoSingletonScope(bind, id) {
    bind(ContributionProvider).toDynamicValue((({container: container}) => new ContributionProviderCache(id, container))).whenTargetNamed(id);
}
//# sourceMappingURL=contribution-provider.js.map