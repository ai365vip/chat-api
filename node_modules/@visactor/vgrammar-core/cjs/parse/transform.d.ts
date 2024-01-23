import type { IGrammarBase, IGrammarTask, IView, TransformSpec } from '../types';
export declare const parseTransformSpec: (spec: TransformSpec[], view: IView) => {
    transforms: IGrammarTask[];
    refs: IGrammarBase[];
};
