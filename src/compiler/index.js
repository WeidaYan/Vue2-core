// ast语法树 是用对象来描述js原生语法的  虚拟dom 用对象来描述dom节点的
// ?: 匹配不捕获
// arguments[0] = 匹配到的标签 arguments[1] 匹配到的标签名字
import {parseHTML} from "./parser-html";

export function compileToFunction(template) {
    // 1)解析html字符串，将html字符串 => ast语法树
    let root = parseHTML(template);
    console.log(root);
    return function render() { };
}

// 何为AST语法树
{
    /* <div id="app">
      <p>hello<p/>
  <div/>
  
  let root = {
      tag: 'div',
      attrs: [{name:'id', value: 'app'}],
      parent: null,
      type: 1,
      children: [
          {
              tag:'p',
              attrs: [],
              parent: root,
              type: 1,
              children: [{
                  text: 'hello',
                  type: 3
              }]
          }
      ]
  } */
}
