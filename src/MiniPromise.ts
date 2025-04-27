
enum STATUS{
    "PENDING"="PENDING",
    "FULFILLED"="FULFILLED",
    "REJECTED"="REJECTED"
}
class MiniPromise<T=any> {
    private status:STATUS=STATUS.PENDING;
    private value: any;
    private reason:any;
    private deferreds=[];

    constructor(executor:Executor<T>){
        // Promise must be constructed via new
        if (!(this instanceof MiniPromise)) {
            throw new TypeError("MiniPromise must be constructed via 'new'");
          }
        try {
            executor(this.resolve,this.reject);
        } catch(error){
            this.reject(error);
        }
    }

    resolve:ResolveFunction<T>=(value)=>{
        if(this.status!==STATUS.PENDING) return;
        
        // 1. Self-resolution check
    
        if(value===this){
            throw new TypeError("A promise cannot be resolved with itself");
        }


        // 2. If value is an object or function (might be a thenable)
        
        if(value && (typeof value==="object" || typeof value==='function')){
            console.log("dsdd",value)
            let then;
            try {
                then=(value as any).then;

            } catch(error){
                this.reject(error);
            }

            if(typeof then==='function'){
                let called=false;
                try {
                    then.call(value, (y:any)=>{
                        if(called) return;
                        called=true;
                        this.resolve(y);
                    }, (r:any)=>{
                        if(called) return;
                        called=true;
                        this.reject(r);
                    })
                } catch(error){
                    if(!called){
                        this.reject(error);
                    }
                }
                return;
            }
        }
        this.status=STATUS.FULFILLED;
        this.value=value;
        
    }


    reject:RejectFunction=(reason?:  any)=>{
        if(this.status!==STATUS.PENDING) return;
        this.status=STATUS.REJECTED;
        this.reason=reason;
    }

    // Checks that the promise is resolved or rejected only once
    

}

