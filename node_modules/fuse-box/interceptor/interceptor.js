"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInterceptor = void 0;
function createInterceptor() {
    const subscriptions = new Map();
    let promises = [];
    // adds an interceptor
    function add(key, fn) {
        let fns = [];
        if (!subscriptions.has(key)) {
            subscriptions.set(key, fns);
        }
        else {
            fns = subscriptions.get(key);
        }
        fns.push(fn);
    }
    const on = function (key, fn) {
        add(key, fn);
    };
    return {
        on,
        promise: function (fn) {
            promises.push(fn());
        },
        resolve: async function () {
            const res = await Promise.all(promises);
            promises = [];
            return res;
        },
        send: async function (key, props) {
            if (subscriptions.has(key)) {
                const fns = subscriptions.get(key);
                const responses = [];
                for (let fn of fns) {
                    responses.push(await fn(props));
                }
                if (responses.length > 0) {
                    // return the latest response
                    return responses[responses.length - 1];
                }
            }
            return props;
        },
        // sync (emit an even which should return an according props
        sync: function (key, props) {
            if (subscriptions.has(key)) {
                const fns = subscriptions.get(key);
                const responses = fns.map(fn => fn(props));
                if (responses.length > 0) {
                    // return the latest response
                    return responses[responses.length - 1];
                }
            }
            return props;
        },
        waitFor: on,
        getPromises: () => promises,
    };
}
exports.createInterceptor = createInterceptor;
