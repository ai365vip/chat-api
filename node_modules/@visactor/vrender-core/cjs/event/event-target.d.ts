import type { INode } from '../interface/node-tree';
import type { IEventTarget } from '../interface/event';
export declare const EventTarget: Omit<IEventTarget, Exclude<keyof INode, 'dispatchEvent'>>;
