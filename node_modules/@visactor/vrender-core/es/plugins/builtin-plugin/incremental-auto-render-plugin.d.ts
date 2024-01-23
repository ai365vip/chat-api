import type { IGroup, IPlugin, IPluginService, IDrawContext } from '../../interface';
export declare class IncrementalAutoRenderPlugin implements IPlugin {
    name: 'IncrementalAutoRenderPlugin';
    activeEvent: 'onRegister';
    pluginService: IPluginService;
    protected nextFrameRenderGroupSet: Set<IGroup>;
    protected willNextFrameRender: boolean;
    nextUserParams: Partial<IDrawContext>;
    _uid: number;
    key: string;
    activate(context: IPluginService): void;
    deactivate(context: IPluginService): void;
    renderNextFrame(group: IGroup): void;
    _doRenderInThisFrame(): void;
}
