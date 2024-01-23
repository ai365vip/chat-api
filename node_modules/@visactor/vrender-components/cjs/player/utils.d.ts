import { OrientType } from '../interface';
import { DirectionType } from './type';
interface ICheckIndex {
    direction: DirectionType;
    maxIndex: number;
    minIndex: number;
    dataIndex: number;
}
export declare const checkIndex: ({ direction, maxIndex, minIndex, dataIndex }: ICheckIndex) => boolean;
export declare const canPlay: ({ direction, maxIndex, minIndex, dataIndex }: ICheckIndex) => boolean;
export declare const isReachEndByDefault: ({ direction, maxIndex, dataIndex }: Omit<ICheckIndex, 'minIndex'>) => boolean;
export declare const isReachEndByReverse: ({ direction, minIndex, dataIndex }: Omit<ICheckIndex, 'maxIndex'>) => boolean;
export declare const isReachEnd: ({ direction, maxIndex, minIndex, dataIndex }: ICheckIndex) => boolean;
export declare const isReachStartByDefault: ({ direction, minIndex, dataIndex }: Omit<ICheckIndex, 'maxIndex'>) => boolean;
export declare const isReachStartByReverse: ({ direction, maxIndex, dataIndex }: Omit<ICheckIndex, 'minIndex'>) => boolean;
export declare const isReachStart: ({ direction, maxIndex, minIndex, dataIndex }: ICheckIndex) => boolean;
export declare const isVertical: (orient: OrientType) => boolean;
export declare const isHorizontal: (orient: OrientType) => boolean;
export declare const forwardStep: (direction: DirectionType, currentIndex: number, min: number, max: number) => number;
export {};
