
import {initState} from "./state";

import {compileToFunction} from './compiler/index';

// 在原型上添加一个init方法
export function initMixin(Vue) {
    // 初始化流程
    Vue.prototype._init = function (options) {
        // 数据的劫持
        // console.log(this)
        const vm = this; // Vue中使用this.$options 指代的就是用户传递的属性
        vm.$options = options;

        // 初始化状态
        initState(vm); // 代码分割


        // 如果用户传入了el属性 需要将页面渲染出来
        // 如果用户传入了el 就要实现挂载流程

        if(vm.$options.el) {
            vm.$mount(vm.$options.el);
        }
    }
    Vue.prototype.$mount = function (el) {
        const vm = this;
        const options = vm.$options;
        el = document.querySelector(el);

        // 查找顺序， render =》 template 》 el

        if(!options.render) {
            // 对模板进行编译
            let template = options.template;
            if(!template && el) {
                template = el.outerHTML
            }
            console.log(template)
            // 我么需要将tempalte转换成render的方法， vue2.0实现虚拟dom vue1.0不是
            const render = compileToFunction(template)
            options.render = render;
        }
    }
}