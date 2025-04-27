# Creating a Promise from Scratch to Understand It in Depth

### Normal Promise Behavior

If we truly understand how a standard Promise behaves, implementing one becomes straightforward. This document explains the subtle internal mechanics of Promises across different scenarios, and the accompanying code will strictly follow these principles.

---

#### Resolution (Understanding How `resolve` Works)

1. **A Promise cannot resolve to itself.**
   
   See the example below.
   
   This will fail with a `TypeError`:
   ```javascript
   var p1 = new MiniPromise((resolve, reject) => {
     resolve(p1);
   });
   ```

2. Now, if the resolved value is:

- **Thenable function** (function with a `.then` method):
  
  ✅ The promise will **adopt** its `.then()` and follow its behavior.
  
  ```javascript
  const thenable = {
    then: function (resolve, reject) {
      setTimeout(() => {
        resolve('Resolved by thenable');
      }, 1000);
    }
  };
  
  const p = new MiniPromise((resolve, reject) => {
    resolve(thenable);
  });
  
  p.then(value => {
    console.log('Success:', value);
  });
  ```

- **Normal function** (function without a `.then` method):
  
  ✅ The promise will **fulfill normally with the function itself**.
  
  Example of resolving with a **normal function**:
  
  ```javascript
  const normalFn = () => console.log("I am a normal function");
  
  const p = new MiniPromise((resolve, reject) => {
    resolve(normalFn);
  });
  
  p.then(fn => {
    console.log(typeof fn);  // "function"
    fn();  // I am a normal function
  });
  ```