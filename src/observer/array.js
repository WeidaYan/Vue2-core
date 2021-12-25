// 我要重写数组的方法 7个 push shift unshift pop reverse sort splice 会导致数组本身发生变化
let oldArrayMethods = Array.prototype;
// value._proto_ = arrayMethods 原型链查找的问题， 会向上查找， 先查找我重写的， 重写的没有会继续向上查找
// arrayMethods._proto_ = oldArrayMethods
// 所以 value => arrayMethods => oldArrayMethods 原型链
export let arrayMethods = Object.create(oldArrayMethods)

const methods = [
    'push',
    'shift',
    'unshift',
    'pop',
    'sort',
    'splice',
    'reverse'
]
methods.forEach(method => {
    arrayMethods[method] = function (...args) {
        console.log('AOP切片编程') // AOP 切片编程
        const result = oldArrayMethods[method].apply(this, args); // 调用原生的数组方法 
        // push unshift 添加的元素可能还是一个对象
        let inserted; // 当前用户插入的元素
        let ob = this.__ob__;
        switch (method) {
            case 'push':
            case 'unshift':
                inserted = args;
                break;
            case 'splice': // 3个新增的属性 splice 有删除 新增的功能 arr.aplice(0,1,{name:1})
                inserted = args.slice(2) 
            default:
                break;
        }
        if(inserted) ob.observerArray(inserted); // 将新增属性继续观测
        return result;

    }
})