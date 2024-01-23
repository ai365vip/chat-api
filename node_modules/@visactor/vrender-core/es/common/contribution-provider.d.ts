import type { interfaces } from '../common/inversify-lite';
export declare const ContributionProvider: unique symbol;
export declare function bindContributionProvider(bind: interfaces.Bind, id: any): void;
export declare function bindContributionProviderNoSingletonScope(bind: interfaces.Bind, id: any): void;
