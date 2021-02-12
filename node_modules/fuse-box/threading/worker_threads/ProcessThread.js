"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const worker_threads_1 = require("worker_threads");
const utils_1 = require("../../utils/utils");
const moduleCompiler_1 = require("../compile/moduleCompiler");
const onResolve = {};
worker_threads_1.parentPort.on('message', msg => {
    const { method, payload } = msg;
    if (method === 'onResolve') {
        if (onResolve[msg.localSession]) {
            onResolve[msg.localSession](msg.payload);
        }
    }
    if (method === 'compile') {
        const mainSession = msg.mainSession;
        moduleCompiler_1.moduleCompiler(Object.assign(Object.assign({}, payload), { onError: opts => {
                worker_threads_1.parentPort.postMessage({ mainSession, method: 'onError', payload: opts });
            }, onFatal: e => {
                worker_threads_1.parentPort.postMessage({ mainSession, method: 'onFatal', payload: e });
            }, onReady: opts => {
                worker_threads_1.parentPort.postMessage({ mainSession, method: 'onReady', payload: opts });
            }, onResolve: async (opts) => {
                const localSession = utils_1.randomHash();
                return new Promise((resolve, reject) => {
                    worker_threads_1.parentPort.postMessage({ localSession, mainSession, method: 'onResolve', payload: opts });
                    onResolve[localSession] = resolve;
                });
            } }));
    }
});
