"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWorkerClients = void 0;
const worker_threads_1 = require("worker_threads");
const env_1 = require("../../env");
const utils_1 = require("../../utils/utils");
function createClientSession(worker) {
    const mainSession = utils_1.randomHash();
    const requests = {};
    return {
        mainSession,
        requests,
        exec: (method, payload) => {
            const data = { mainSession, method, payload };
            worker.postMessage(data);
        },
        onRequest: (method, fn) => {
            requests[method] = fn;
        },
        respond: async (localSession, method, payload) => {
            if (requests[method]) {
                const data = await requests[method](payload);
                if (data)
                    worker.postMessage({ localSession, mainSession, method: method, payload: data });
            }
        },
    };
}
function createWorkerClients(config) {
    const Sessions = {};
    const WORKERS = [];
    function createWorker() {
        const worker = new worker_threads_1.Worker(env_1.env.WORKER_THREAD, {});
        WORKERS.push(worker);
        worker.on('message', data => {
            const session = Sessions[data.mainSession];
            if (session)
                session.respond(data.localSession, data.method, data.payload);
        });
        return worker;
    }
    let useId = -1;
    function pickWorker() {
        useId++;
        if (WORKERS[useId]) {
            return WORKERS[useId];
        }
        useId = -1;
        return WORKERS[0];
    }
    return {
        compile: (props) => {
            const gotWorker = pickWorker();
            if (!gotWorker) {
                process.exit(0);
            }
            const session = createClientSession(gotWorker);
            Sessions[session.mainSession] = session;
            const serializedProps = {
                absPath: props.absPath,
                contents: props.contents,
                context: props.context,
                generateCode: props.generateCode,
            };
            session.exec('compile', serializedProps);
            session.onRequest('onResolve', arg => {
                return props.onResolve(arg);
            });
            session.onRequest('onFatal', e => {
                props.onFatal && props.onFatal(e);
                return Promise.resolve();
            });
            session.onRequest('onError', arg => {
                props.onError(arg);
                return Promise.resolve();
            });
            session.onRequest('onReady', arg => {
                props.onReady(arg);
                return Promise.resolve();
            });
        },
        launch: () => {
            for (let i = 0; i < config.threadAmount; i++) {
                createWorker();
            }
        },
        terminate: () => {
            for (const worker of WORKERS) {
                worker.terminate();
            }
        },
    };
}
exports.createWorkerClients = createWorkerClients;
