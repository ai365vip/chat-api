export type FunctionControlOptions = {
    leading?: boolean;
    trailing?: boolean;
    maxWait?: number;
};
declare function debounce<T, S>(func: (...args: T[]) => S, wait: number, options?: FunctionControlOptions): (...args: T[]) => S;
export default debounce;
