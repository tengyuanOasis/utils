/* 一个简单的vue异常处理脚本 */

function errorHandler(err, vm, info) {
	console.log('vue异常错误捕获: ', '错误信息 ' + info);
}

function isPromise(ret) {
	return ret && typeof ret.then === 'function' && typeof ret.catch === 'function';
}

const handleMethods = (instance) => {
	if (instance.$options.methods) {
		let actions = instance.$options.methods || {};
		for (const key in actions) {
			if (Object.hasOwnProperty.call(actions, key)) {
				let fn = actions[key];
				actions[key] = function (...args) {
					let ret = args.length > 0 ? fn.apply(this, args) : fn.call(this);
					if (isPromise(ret) && !ret._handled) {
						ret._handled = true;
						return ret.catch((e) =>
							errorHandler(e, this, `捕获到了未处理的Promise异常： (Promise/async)`)
						);
					}
				};
			}
		}
	}
};

export default GlobalError = {
	install: (Vue, options) => {
		Vue.config.errorHandler = errorHandler;
		window.onerror = function (message, source, line, column, error) {
			errorHandler(message, null, '全局捕获错误');
		};
		window.addEventListener('unhandledrejection', (event) => {
			errorHandler(event, null, '全局捕获未处理的Promise异常');
		});
		Vue.mixin({
			beforeCreate() {
				this.$route.meta.capture && handleMethods(this);
			}
		});
	}
};
