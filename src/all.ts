import {MiniPromise} from "./MiniPromise";

export function miniPromiseAll(promises:Array<any>){
    return new MiniPromise((resolve,reject)=>{
        const results:any[]=[];
        let completed=0;

        if(promises.length===0) return resolve([]);

        promises.forEach((p,index)=>{
            MiniPromise.resolve(p).then((val)=>{
                results[index]=val;
                completed+=1;
                if(completed===promises.length){
                    resolve(results);
                }
            }, reject);
        });
    });
}