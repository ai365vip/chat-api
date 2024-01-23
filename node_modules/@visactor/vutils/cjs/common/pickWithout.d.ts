export default function pickWithout<T extends Record<string, any>>(obj: T, keys: (string | RegExp)[]): Partial<T>;
