import type { IPlugin, IPluginService } from '../../interface';
export declare class DirtyBoundsPlugin implements IPlugin {
    name: 'DirtyBoundsPlugin';
    activeEvent: 'onRegister';
    pluginService: IPluginService;
    _uid: number;
    key: string;
    activate(context: IPluginService): void;
    deactivate(context: IPluginService): void;
}
