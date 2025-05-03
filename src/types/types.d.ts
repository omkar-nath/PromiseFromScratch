type ResolveFunction<T> = (value: T | any) => void;
type RejectFunction = (reason?: any) => void;

type Executor<T> = (resolve: ResolveFunction<T>, reject: RejectFunction) => void;

type Handler<T, U> = {
  onFulfilled?: (value: T) => U | MiniPromise<U>;
  onRejected?: (reason: any) => U | MiniPromise<U>;
  resolve: (value: U | MiniPromise<U>) => void;
  reject: (reason?: any) => void;
};
