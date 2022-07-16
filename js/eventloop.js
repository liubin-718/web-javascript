事件循环  https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/EventLoop
之所以称之为 事件循环，是因为它经常按照类似如下的方式来被实现：

while (queue.waitForMessage()) {
  queue.processNextMessage();
}
queue.waitForMessage() 会同步地等待消息到达(如果当前没有任何消息等待被处理)。

"执行至完成"
每一个消息完整地执行后，其它消息才会被执行。这为程序的分析提供了一些优秀的特性，包括：当一个函数执行时，它不会被抢占，只有在它运行完毕之后才会去运行任何其他的代码，才能修改这个函数操作的数据。这与C语言不同，例如，如果函数在线程中运行，它可能在任何位置被终止，然后在另一个线程中运行其他代码。

这个模型的一个缺点在于当一个消息需要太长时间才能处理完毕时，Web应用程序就无法处理与用户的交互，例如点击或滚动。为了缓解这个问题，浏览器一般会弹出一个“这个脚本运行时间过长”的对话框。一个良好的习惯是缩短单个消息处理时间，并在可能的情况下将一个消息裁剪成多个消息。

添加消息
在浏览器里，每当一个事件发生并且有一个事件监听器绑定在该事件上时，一个消息就会被添加进消息队列。如果没有事件监听器，这个事件将会丢失。所以当一个带有点击事件处理器的元素被点击时，就会像其他事件一样产生一个类似的消息。

函数 setTimeout 接受两个参数：待加入队列的消息和一个时间值（可选，默认为 0）。这个时间值代表了消息被实际加入到队列的最小延迟时间。如果队列中没有其它消息并且栈为空，在这段延迟时间过去之后，消息会被马上处理。但是，如果有其它消息，setTimeout 消息必须等待其它消息处理完。因此第二个参数仅仅表示最少延迟时间，而非确切的等待时间。

下面的例子演示了这个概念（setTimeout 并不会在计时器到期之后直接执行）：

const s = new Date().getSeconds();

setTimeout(function() {
  // 输出 "2"，表示回调函数并没有在 500 毫秒之后立即执行
  console.log("Ran after " + (new Date().getSeconds() - s) + " seconds");
}, 500);

while(true) {
  if(new Date().getSeconds() - s >= 2) {
    console.log("Good, looped for 2 seconds");
    break;
  }
}

// 2、  
setTimeout(function () {
  console.log("1");
}, 0);
async function async1() {
  console.log("2");
  const data = await async2();
  console.log("3");
  return data;
}
async function async2() {
  return new Promise((resolve) => {
    console.log("4");
    resolve("async2的结果");
  }).then((data) => {
    console.log("5");
    return data;
  });
}
async1().then((data) => {
  console.log("6");
  console.log(data);
});
new Promise(function (resolve) {
  console.log("7");
  //   resolve()
}).then(function () {
  console.log("8");
});



new Promise((resolve, reject) => {
  console.log(1)
  setTimeout(() => {
    resolve('异步任务获取的数据')
    new Promise((resolve, reject) => {
      console.log('1a')
      setTimeout(() => {
        resolve('异步任务获取的数据a')
      }, 500)
    }).then((data) => {
      console.log('9a')
      console.log(data)
      console.log('3a')
    })
  }, 2000)
}).then((data) => {
  console.log(9)
  console.log(data)
  console.log(3)
})

// 输出结果：247536 async2 的结果 1
// 注意！我在最后一个 Promise 埋了个坑 我没有调用 resolve 方法 
/* 
async function async2() {
  return new Promise((resolve) => {
    console.log("4");
    resolve("async2的结果");
  }).then((data) => {
    console.log("5", data);
    return data;
  });
}
4
5
async2的結果
Promise{<fulfilled>: 'async2的結果'}
*/

let res = (function pt() {
  return (() => this.x).bind({ x: 'inner' })();
}).call({ x: 'outer' });

console.log(res)  // 问 输出结果