### 一个简单的 vue 异常全局处理函数

1. vue 异常处理

```js
Vue.config.errorHandler = function (err, vm, info) {
	console.log(err, vm, info);
};
```

2. 外部 js 异常处理

```js
window.onerror = function (msg, url, line, col, error) {
	console.log(msg, url, line, col, error);
};
```

3. promise 异常处理

```js
/* 全局捕获未处理的Promise异常 */
window.addEventListener('unhandledrejection', (event) => {
	console.log('全局捕获未处理的Promise异常', event);
});
```

```js
function isPromise(ret) {
	return ret && typeof ret.then === 'function' && typeof ret.catch === 'function';
}

/* 异常处理函数 */
const handleMethods = (instance) => {
	/* 判断 Vue 实例是否定义了方法 */
	if (instance.$options.methods) {
		/* 如果存在方法，将其存储在变量 actions 中，如果不存在方法，则将 actions 初始化为空对象。 */
		let actions = instance.$options.methods || {};
		for (const key in actions) {
			/* 确保遍历的属性是 actions 自身的属性，而不是继承来的属性。 */
			if (Object.hasOwnProperty.call(actions, key)) {
				/* 获取当前遍历到的方法，并存储在变量 fn 中。 */
				let fn = actions[key];
				/* 对当前遍历到的方法进行重新赋值，使用了 ES6 的扩展运算符 ...args 来接收任意数量的参数。 */
				actions[key] = function (...args) {
					/* 调用当前方法 fn，并根据传入的参数数量决定使用 apply 还是 call 方法来执行，将执行结果存储在变量 ret 中。 */
					let ret = args.length > 0 ? fn.apply(this, args) : fn.call(this);
					/* 判断 ret 是否为 Promise 对象，并且确保这个 Promise 对象没有被处理过。 */
					if (isPromise(ret) && !ret._handled) {
						/* 将 ret 对象的 _handled 属性设置为 true，表示已经处理过这个 Promise 对象。 */
						ret._handled = true;
						/* 如果满足条件，则将 Promise 对象链式调用 catch 方法，捕获可能抛出的异常，并调用统一的错误处理函数 errorHandler 进行处理。 */
						return ret.catch((e) =>
							errorHandler(e, this, `捕获到了未处理的Promise异常： (Promise/async)`)
						);
					}
				};
			}
		}
	}
};

export default {
	install: (Vue, options) => {
		Vue.mixin({
			beforeCreate() {
				this.$route.meta.capture && handleMethods(this);
			}
		});
	}
};
```

4. 接口异常处理

TODO：

- [ ] 静态资源异常处理
- [ ] 外部 js 异常处理
