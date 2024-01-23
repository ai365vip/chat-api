declare function injectable(): <T extends abstract new (...args: any) => unknown>(target: T) => T;
export { injectable };
