import type { IGraphic } from '../graphic';
import type { IGroup } from './group';
export interface IShadowRoot extends IGroup {
    shadowHost: IGraphic;
}
