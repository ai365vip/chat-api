export default function pick<T, U extends keyof T>(obj: T, keys: Array<U>): Pick<T, U>;
