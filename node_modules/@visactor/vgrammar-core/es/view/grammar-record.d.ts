import type { ICoordinate, IData, IGrammarBase, IMark, IScale, ISignal, IRecordedGrammars, IMarkTreeNode, IRecordedTreeGrammars } from '../types';
export declare class RecordedGrammars implements IRecordedGrammars {
    private _warning;
    private _mapKey;
    private _grammars;
    private _grammarMap;
    private _size;
    constructor(mapKey: string | ((grammar: IGrammarBase) => string), warningWhenDuplicated?: (key: string, grammar: IGrammarBase) => void);
    record(grammar: IGrammarBase): this;
    unrecord(grammar: IGrammarBase): this;
    size(): number;
    getSignal<T>(key: string): ISignal<T> | null;
    getData(key: string): IData | null;
    getScale(key: string): IScale | null;
    getCoordinate(key: string): ICoordinate | null;
    getMark(key: string): IMark | null;
    getCustomized(key: string): IGrammarBase | null;
    getGrammar(key: string): IGrammarBase | null;
    getAllSignals(): ISignal<any>[];
    getAllData(): IData[];
    getAllScales(): IScale[];
    getAllCoordinates(): ICoordinate[];
    getAllMarks(): IMark[];
    getAllCustomized(): IGrammarBase[];
    traverse(func: (grammar: IGrammarBase) => boolean | void): void;
    find(func: (grammar: IGrammarBase) => boolean): IGrammarBase;
    filter(func: (grammar: IGrammarBase) => boolean): IGrammarBase[];
    clear(): void;
    release(): void;
}
export declare class RecordedTreeGrammars extends RecordedGrammars implements IRecordedTreeGrammars {
    private _markNodes;
    record(grammar: IGrammarBase): this;
    unrecord(grammar: IGrammarBase): this;
    getAllMarkNodes(): IMarkTreeNode[];
    clear(): void;
    release(): void;
}
export declare const releaseUpMarkNode: (node: IMarkTreeNode) => void;
