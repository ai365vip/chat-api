export type Nil = null | undefined;
export type DistributiveOmit<T, K extends keyof T> = T extends unknown ? Omit<T, K> : never;
export type DistributivePick<T, K extends keyof T> = T extends unknown ? Pick<T, K> : never;
export type RecursivePartial<T> = {
    [P in keyof T]?: T[P] extends Array<infer U> ? Array<Value<U>> : Value<T[P]>;
};
type AllowedPrimitives = boolean | string | number | Date;
type Value<T> = T extends AllowedPrimitives ? T : RecursivePartial<T>;
export type Vector2<T> = [T, T];
export type Vector3<T> = [T, T, T];
export type Vector4<T> = [T, T, T, T];
export type Vector5<T> = [T, T, T, T, T];
export type Vector6<T> = [T, T, T, T, T, T];
export type Vector7<T> = [T, T, T, T, T, T, T];
export type Vector10<T> = [T, T, T, T, T, T, T, T, T, T];
export type Vector12<T> = [T, T, T, T, T, T, T, T, T, T, T, T];
export type CommonPaddingSpec = number | {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
};
export type DiffResult<Prev, Next> = {
    enter: {
        next: Next;
    }[];
    update: {
        prev: Prev;
        next: Next;
    }[];
    exit: {
        prev: Prev;
    }[];
};
export type ValueOf<T, K extends keyof T = keyof T> = T[K];
export {};
