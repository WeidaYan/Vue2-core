// 把data中的数据 都使用object.defineProperty 重新定义data
// Object.defineProperty 不能兼容ie8及以下 vue2 无法兼容ie8版本
import {arrayMethods} from './array';
import {isObject, def } from '../util/index';

class Observer{
    constructor(value) {
        // vue如果数据的层次过多 需要递归的去解析对象中的属性，依次增加set和get方法
        // value.__ob__ = this; // 我给每一个监控过的对象都增加一个_ob_属性
        def(value, '__ob__', this);
        // Object.defineProperty(value, '__ob__', {
        //     enumerable: false,
        //     configurable: false,
        //     value: this
        // })
        if(Array.isArray(value)) {
            // 对数组进行监测
            // 如果是数组的话并不会对索引进行观测，因为会导致性能问题
            // 前端开发中很少去操作索引 常用的是 push shift splice等方法,把这些方法进行了重新定义，oop

            value.__proto__ = arrayMethods;
            // 如果数组里放的是对象我再监控
            this.observerArray(value);

        }else {
            this.walk(value) // 对对象进行监测
        }
    }
    observerArray(value) {
        for(let i=0;i<value.length;i++) {
            observe(value[i]);
        }
    }
    walk(data) { // 让对象上的所有属性依次进行观测
        let keys = Object.keys(data); // [name,age,address]
        keys.forEach((key) => {
            defineReactive(data,key,data[key]) // 定义响应式数据,vue响应式的核心方法
        })
    }
}

function defineReactive(data,key,value) {
    observe(value); // 递归实现深度监测
    Object.defineProperty(data, key, {
        get() { // 获取值的时候做一些操作
            return value;
        },
        set(newValue) { // 设置值的时候做一些操作 依赖收集？
            if(newValue === value) return;
            console.log('值变化了')
            observe(newValue); // 继续劫持用户设置的值，因为有可能用户设置的值是一个对象
            value = newValue;
        }
    })
}

export function observe(data) {
    let isObj = isObject(data);
    if(!isObj) {
        return;
    }
    return new Observer(data) // 用来观测数据
}