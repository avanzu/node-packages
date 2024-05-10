export type Constructor<T = any> = new (...args: any[]) => T;
export function isClass<T>(value: Function): value is Constructor<T> {
    return value.constructor && typeof value.constructor === 'function';
}
