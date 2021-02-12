import { InterceptorEvents } from './events';
interface TypedInterceptor<T> {
    getPromises: () => Array<any>;
    on<K extends keyof T>(key: K, fn: (props: T[K]) => any): any;
    promise: (fn: () => Promise<any>) => void;
    resolve: () => Promise<any>;
    send<K extends keyof T>(key: K, props: T[K]): Promise<T[K]>;
    sync<K extends keyof T>(key: K, props: T[K]): T[K];
    waitFor<K extends keyof T>(key: K, fn: (props: T[K]) => Promise<T[K]>): any;
}
export declare type MainInterceptor = TypedInterceptor<InterceptorEvents>;
export declare function createInterceptor(): MainInterceptor;
export {};
