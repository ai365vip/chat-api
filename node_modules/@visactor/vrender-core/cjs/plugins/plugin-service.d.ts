import type { IContributionProvider, IPlugin, IPluginService, IStage } from '../interface';
export declare class DefaultPluginService implements IPluginService {
    protected readonly autoEnablePlugins: IContributionProvider<IPlugin>;
    onStartupFinishedPlugin: IPlugin[];
    onRegisterPlugin: IPlugin[];
    stage: IStage;
    actived: boolean;
    constructor(autoEnablePlugins: IContributionProvider<IPlugin>);
    active(stage: IStage, params: {
        pluginList?: string[];
    }): void;
    findPluginsByName(name: string): IPlugin[];
    register(plugin: IPlugin): void;
    unRegister(plugin: IPlugin): void;
    release(...params: any): void;
}
