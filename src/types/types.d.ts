type ResolveFunction<T>=(value: T | any)=>void;
type RejectFunction=(reason?: any)=>void;

type Executor<T> = (resolve: ResolveFunction<T>, reject:RejectFunction)=>void;

