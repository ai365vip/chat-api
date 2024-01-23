import type { IAnimateArranger, IAnimator } from '../../types/animate';
export declare class Arranger implements IAnimateArranger {
    afterArranger: IAnimateArranger;
    parallelArrangers: IAnimateArranger[];
    animators: IAnimator[];
    totalTime: number;
    startTime: number;
    endTime: number;
    constructor(animators: IAnimator[]);
    parallel(arranger: IAnimateArranger): this;
    after(arranger: IAnimateArranger): this;
    arrangeTime(): void;
}
