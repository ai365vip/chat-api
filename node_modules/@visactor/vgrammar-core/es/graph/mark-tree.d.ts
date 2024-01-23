import type { IMark } from '../types';
export declare const traverseMarkTree: (rootMark: IMark, childrenKey: 'children' | 'layoutChildren', apply: (mark: IMark) => any, filter?: (mark: IMark) => boolean, leafFirst?: boolean) => void;
