import type { interfaces } from '../interfaces/interfaces';
declare class QueryableString implements interfaces.QueryableString {
    private str;
    constructor(str: string);
    contains(searchString: string): boolean;
    equals(compareString: string): boolean;
    value(): string;
}
export { QueryableString };
