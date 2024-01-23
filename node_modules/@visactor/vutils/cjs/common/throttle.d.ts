declare function throttle<T, S>(func: (...args: T[]) => S, wait: number, options?: {
    leading?: boolean;
    trailing?: boolean;
}): (...args: T[]) => S;
export default throttle;
