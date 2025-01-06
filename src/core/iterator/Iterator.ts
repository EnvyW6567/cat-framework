export interface Iterator {
    next(): Promise<Function | void>;

    hasNext(): boolean;
}