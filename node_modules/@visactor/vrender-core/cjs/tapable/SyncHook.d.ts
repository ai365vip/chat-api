import type { AsArray, ISyncHook, UnsetAdditionalOptions } from '../interface';
import { Hook } from './Hook';
export declare class SyncHook<T, R = void, AdditionalOptions = UnsetAdditionalOptions> extends Hook<T, R, AdditionalOptions> implements ISyncHook<T, R, AdditionalOptions> {
    call(...args: AsArray<T>): R;
}
