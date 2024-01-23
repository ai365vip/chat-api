import type { IContext2d, EnvType } from '@visactor/vrender-core';
import { FeishuContext2d } from '../feishu';
export declare class TTContext2d extends FeishuContext2d implements IContext2d {
    static env: EnvType;
}
