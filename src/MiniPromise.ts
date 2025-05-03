import { miniPromiseAll } from './all';

enum STATUS {
  'PENDING' = 'PENDING',
  'FULFILLED' = 'FULFILLED',
  'REJECTED' = 'REJECTED',
}
export class MiniPromise<T = any> {
  private status: STATUS = STATUS.PENDING;
  private value: any;
  private reason: any;
  private deferreds: Handler<T, any>[] = [];
  static all:typeof miniPromiseAll;

  constructor(executor: Executor<T>) {
    // Promise must be constructed via new
    if (!(this instanceof MiniPromise)) {
      throw new TypeError("MiniPromise must be constructed via 'new'");
    }
    try {
      executor(this.resolve, this.reject);
    } catch (error) {
      this.reject(error);
    }
  }

  resolve: ResolveFunction<T> = value => {
    if (this.status !== STATUS.PENDING) return;

    // 1. Self-resolution check
    if (value === this) {
      throw new TypeError('A promise cannot be resolved with itself');
    }

    // 2. If value is an object or function (might be a thenable)
    if (value && (typeof value === 'object' || typeof value === 'function')) {
      let then;
      try {
        then = (value as any).then;
      } catch (error) {
        this.reject(error);
      }

      if (typeof then === 'function') {
        let called = false;
        try {
          then.call(
            value,
            (y: any) => {
              if (called) return;
              called = true;
              this.resolve(y);
            },
            (r: any) => {
              if (called) return;
              called = true;
              this.reject(r);
            },
          );
        } catch (error) {
          if (!called) {
            this.reject(error);
          }
        }
        return;
      }
    }
    this.status = STATUS.FULFILLED;
    this.value = value;
    this.finale();
  };

  reject: RejectFunction = (reason?: any) => {
    if (this.status !== STATUS.PENDING) return;
    this.status = STATUS.REJECTED;
    this.reason = reason;
    this.finale();
  };

  private handle<U>(handler: Handler<T, U>) {
    if (this.status === STATUS.PENDING) {
      this.deferreds.push(handler);
      return;
    }

    queueMicrotask(() => {
      const cb = this.status === STATUS.FULFILLED ? handler.onFulfilled : handler.onRejected;

      if (!cb) {
        if (this.status === STATUS.FULFILLED) {
          handler.resolve(this.value);
        } else {
          handler.reject(this.reason);
        }
        return;
      }

      try {
        const result = cb(this.status === STATUS.FULFILLED ? this.value : this.reason);
        handler.resolve(result as any);
      } catch (error) {
        handler.reject(error);
      }
    });
  }

  then<U = any>(
    onFulfilled?: (value: T) => U | MiniPromise<U>,
    onRejected?: (reason: any) => U | MiniPromise<U>,
  ): MiniPromise<U> {
    // 1. Let C be the constructor of this value
    const C = this.constructor as typeof MiniPromise;

    // 2. Let the promiseCapability be new promise capability

    const promiseCapability = new C(() => {}) as MiniPromise<U>;

    // 3. Normalise callbacks

    const fulfilledHandler = typeof onFulfilled === 'function' ? onFulfilled : undefined;
    const rejectedHandler = typeof onRejected === 'function' ? onRejected : undefined;

    // 4. Perform actual then operation
    this.handle({
      onFulfilled: fulfilledHandler,
      onRejected: rejectedHandler,
      resolve: promiseCapability.resolve,
      reject: promiseCapability.reject,
    });

    // 5. Return new Promise

    return promiseCapability;
  }

  private finale() {
    for (const handler of this.deferreds) {
      this.handle(handler);
    }
    this.deferreds = [];
  }

  catch<U = any>(onRejected?: (reason: any) => U | MiniPromise<U>): MiniPromise<U> {
   return this.then(undefined, onRejected);
  }
  static resolve<T>(value: T | MiniPromise<T>): MiniPromise<T> {
    if (value instanceof this) return value;
    return new this(resolve => resolve(value));
  }

  static reject<T = never>(reason: any): MiniPromise<T> {
    return new this((_, reject) => reject(reason));
  }

  finally(onFinally?: () => void): MiniPromise<T> {
    return this.then(
      value => {
        onFinally?.();
        return value;
      },
      reason => {
        onFinally?.();
        throw reason;
      },
    );
  }
}

MiniPromise.all = miniPromiseAll;

const p= new Promise((resolve)=>{
    setTimeout(() => {
    resolve(1) 
    }, 1000);
}
)
MiniPromise.all([
    p,
    MiniPromise.resolve(2),
    MiniPromise.resolve(3)
  ]).then(console.log)