"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCompilerHub = void 0;
const moduleCompiler_1 = require("../compile/moduleCompiler");
const WorkerClient_1 = require("./WorkerClient");
function createCompilerHub(ctx) {
    const config = ctx.config.threading;
    let worker;
    return {
        compile: (props) => {
            // doing it the normal way
            if (!config.enabled)
                return moduleCompiler_1.moduleCompiler(props);
            const size = Buffer.byteLength(props.contents, 'utf8');
            if (config.minFileSize === 0 || size >= config.minFileSize) {
                worker.compile(props);
            }
            else {
                moduleCompiler_1.moduleCompiler(props);
            }
        },
        launch: () => {
            if (config.enabled) {
                worker = WorkerClient_1.createWorkerClients(config);
                worker.launch();
            }
        },
        terminate: () => {
            if (config.enabled)
                worker.terminate();
        },
    };
}
exports.createCompilerHub = createCompilerHub;
