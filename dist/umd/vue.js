(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

  function _typeof(obj) {
    "@babel/helpers - typeof";

    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
      return typeof obj;
    } : function (obj) {
      return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    }, _typeof(obj);
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    Object.defineProperty(Constructor, "prototype", {
      writable: false
    });
    return Constructor;
  }

  // 我要重写数组的方法 7个 push shift unshift pop reverse sort splice 会导致数组本身发生变化
  var oldArrayMethods = Array.prototype; // value._proto_ = arrayMethods 原型链查找的问题， 会向上查找， 先查找我重写的， 重写的没有会继续向上查找
  // arrayMethods._proto_ = oldArrayMethods
  // 所以 value => arrayMethods => oldArrayMethods 原型链

  var arrayMethods = Object.create(oldArrayMethods);
  var methods = ['push', 'shift', 'unshift', 'pop', 'sort', 'splice', 'reverse'];
  methods.forEach(function (method) {
    arrayMethods[method] = function () {
      console.log('AOP切片编程'); // AOP 切片编程

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      var result = oldArrayMethods[method].apply(this, args); // 调用原生的数组方法 
      // push unshift 添加的元素可能还是一个对象

      var inserted; // 当前用户插入的元素

      var ob = this.__ob__;

      switch (method) {
        case 'push':
        case 'unshift':
          inserted = args;
          break;

        case 'splice':
          // 3个新增的属性 splice 有删除 新增的功能 arr.aplice(0,1,{name:1})
          inserted = args.slice(2);
      }

      if (inserted) ob.observerArray(inserted); // 将新增属性继续观测

      return result;
    };
  });

  /**
   * 
   * @param {*} data 当前数据是不是对象
   * @returns 
   */
  function isObject(data) {
    return _typeof(data) === 'object' && data !== null;
  }
  function def(data, key, value) {
    Object.defineProperty(data, key, {
      enumerable: false,
      configurable: false,
      value: value
    });
  }

  var Observer = /*#__PURE__*/function () {
    function Observer(value) {
      _classCallCheck(this, Observer);

      // vue如果数据的层次过多 需要递归的去解析对象中的属性，依次增加set和get方法
      // value.__ob__ = this; // 我给每一个监控过的对象都增加一个_ob_属性
      def(value, '__ob__', this); // Object.defineProperty(value, '__ob__', {
      //     enumerable: false,
      //     configurable: false,
      //     value: this
      // })

      if (Array.isArray(value)) {
        // 对数组进行监测
        // 如果是数组的话并不会对索引进行观测，因为会导致性能问题
        // 前端开发中很少去操作索引 常用的是 push shift splice等方法,把这些方法进行了重新定义，oop
        value.__proto__ = arrayMethods; // 如果数组里放的是对象我再监控

        this.observerArray(value);
      } else {
        this.walk(value); // 对对象进行监测
      }
    }

    _createClass(Observer, [{
      key: "observerArray",
      value: function observerArray(value) {
        for (var i = 0; i < value.length; i++) {
          observe(value[i]);
        }
      }
    }, {
      key: "walk",
      value: function walk(data) {
        // 让对象上的所有属性依次进行观测
        var keys = Object.keys(data); // [name,age,address]

        keys.forEach(function (key) {
          defineReactive(data, key, data[key]); // 定义响应式数据,vue响应式的核心方法
        });
      }
    }]);

    return Observer;
  }();

  function defineReactive(data, key, value) {
    observe(value); // 递归实现深度监测

    Object.defineProperty(data, key, {
      get: function get() {
        // 获取值的时候做一些操作
        return value;
      },
      set: function set(newValue) {
        // 设置值的时候做一些操作 依赖收集？
        if (newValue === value) return;
        console.log('值变化了');
        observe(newValue); // 继续劫持用户设置的值，因为有可能用户设置的值是一个对象

        value = newValue;
      }
    });
  }

  function observe(data) {
    var isObj = isObject(data);

    if (!isObj) {
      return;
    }

    return new Observer(data); // 用来观测数据
  }

  function initState(vm) {
    var opts = vm.$options; // console.log(opts)
    // vue的数据来源 属性 方法 数据 计算属性 watch

    if (opts.props) ;

    if (opts.methods) ;

    if (opts.data) {
      initData(vm);
    }

    if (opts.computed) ;

    if (opts.watch) ;
  }

  function initData(vm) {
    // console.log('初始化数据', vm.$options.data)
    // 数据初始化工作
    var data = vm.$options.data; // 用户传递的data

    data = vm._data = typeof data === 'function' ? data.call(vm) : data; // console.log(data)
    // 对象劫持 用户改变了数据 我希望可以得到通知 =》 刷新页面
    // MVVM模式 数据变化可以驱动使徒变化
    // Object.defineProperty()给属性增加get()方法和set()方法

    observe(data); // 响应式原理
  }

  var ncname = "[a-zA-Z_][\\-\\.0-9_a-zA-Z]*"; // abc-aaa

  var qnameCapture = "((?:".concat(ncname, "\\:)?").concat(ncname, ")"); // <aaa:asdads>

  var startTagOpen = new RegExp("^<".concat(qnameCapture)); // 标签开头的正则 捕获的内容是标签名

  var endTag = new RegExp("^<\\/".concat(qnameCapture, "[^>]*>")); // 匹配标签结尾的 </div>

  var attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; // 匹配属性的

  var startTagClose = /^\s*(\/?)>/; // 匹配标签结束的 >
  var root = null; // ast语法的树根

  var currentParent; // 标识当前父亲是谁

  var stack = [];
  var ELEMENT_TYPE = 1;
  var TEXT_TYPE = 3;

  function createASTElement(tagName, attrs) {
    return {
      tag: tagName,
      type: ELEMENT_TYPE,
      children: [],
      attrs: attrs,
      parent: null
    };
  }

  function start(tagName, attrs) {
    // console.log('开始标签:', tagName, '属性是:', attrs)
    // 遇到开始标签 就创建一个ast元素s
    var elment = createASTElement(tagName, attrs);

    if (!root) {
      root = elment;
    }

    currentParent = elment; // 把当前元素标记成父ast树

    stack.push(elment); // 将开始标签存放到栈中
  }

  function chars(text) {
    // console.log('文本是:', text)
    text = text.replace(/\s/g, "");

    if (text) {
      currentParent.children.push({
        text: text,
        type: TEXT_TYPE
      });
    }
  } // <div><p> [div] <div> <p></p></div>


  function end(tagName) {
    // console.log('结束标签:', tagName)
    var element = stack.pop(); // 拿到的是AST对象
    // 我要标识当前这个p是属于div的儿子的

    currentParent = stack[stack.length - 1];

    if (currentParent) {
      element.parent = currentParent;
      currentParent.children.push(element); // 实现了一个树的父子关系
    }
  }

  function parseHTML(html) {
    // 不停的去解析html字符串
    while (html) {
      var textEnd = html.indexOf("<");

      if (textEnd == 0) {
        // 如果当前索引为0 肯定是一个标签 开始标签或结束标签
        var startTagMatch = parseStartTag(); // 通过这个方法获取到匹配的结果 tagName ， attrs

        if (startTagMatch) {
          start(startTagMatch.tagName, startTagMatch.attrs); // 1解析开始标签

          continue; // 如果开始标签匹配完毕后， 继续下一次 匹配
        }

        var endTagMatch = html.match(endTag);

        if (endTagMatch) {
          advance(endTagMatch[0].length);
          end(endTagMatch[1]); // 2解析结束标签

          continue;
        }
      }

      var text = void 0;

      if (textEnd >= 0) {
        text = html.substring(0, textEnd);
      }

      if (text) {
        advance(text.length);
        chars(text); // 解析文本
      }
    }

    function advance(n) {
      html = html.substring(n);
    }

    function parseStartTag() {
      var start = html.match(startTagOpen);

      if (start) {
        var match = {
          tagName: start[1],
          attrs: []
        };
        advance(start[0].length);
        console.log(html);

        var _end, attr;

        while (!(_end = html.match(startTagClose)) && (attr = html.match(attribute))) {
          advance(attr[0].length); // 将属性去掉

          match.attrs.push({
            name: attr[1],
            value: attr[3] || attr[4] || attr[5]
          });
        }

        if (_end) {
          // 去掉开始标签的 >
          advance(_end[0].length);
          return match;
        }
      }
    }

    return root;
  }

  // ast语法树 是用对象来描述js原生语法的  虚拟dom 用对象来描述dom节点的
  function compileToFunction(template) {
    // 1)解析html字符串，将html字符串 => ast语法树
    var root = parseHTML(template);
    console.log(root);
    return function render() {};
  } // 何为AST语法树

  function initMixin(Vue) {
    // 初始化流程
    Vue.prototype._init = function (options) {
      // 数据的劫持
      // console.log(this)
      var vm = this; // Vue中使用this.$options 指代的就是用户传递的属性

      vm.$options = options; // 初始化状态

      initState(vm); // 代码分割
      // 如果用户传入了el属性 需要将页面渲染出来
      // 如果用户传入了el 就要实现挂载流程

      if (vm.$options.el) {
        vm.$mount(vm.$options.el);
      }
    };

    Vue.prototype.$mount = function (el) {
      var vm = this;
      var options = vm.$options;
      el = document.querySelector(el); // 查找顺序， render =》 template 》 el

      if (!options.render) {
        // 对模板进行编译
        var template = options.template;

        if (!template && el) {
          template = el.outerHTML;
        }

        console.log(template); // 我么需要将tempalte转换成render的方法， vue2.0实现虚拟dom vue1.0不是

        var render = compileToFunction(template);
        options.render = render;
      }
    };
  }

  // Vue的核心代码 只是Vue的一个声明

  function Vue(options) {
    // 进行Vue的初始化操作
    this._init(options);
  } // 通过引入文件的形式 给Vue原型上添加方法


  initMixin(Vue); // 给Vue原型上添加一个_init方法

  return Vue;

}));
//# sourceMappingURL=vue.js.map
