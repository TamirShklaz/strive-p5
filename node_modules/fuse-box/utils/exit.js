"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onExit = void 0;
const handlers = {};
function onExit(name, exitHandler) {
    handlers[name] = exitHandler;
}
exports.onExit = onExit;
function globalExitHandler(type, e) {
    for (const key in handlers) {
        handlers[key](type);
    }
    if (type === 'uncaughtException') {
        console.error(e);
    }
    if (type === 'exit') {
        process.exit();
    }
}
process.on('exit', e => globalExitHandler('cleanup', e));
process.on('SIGINT', e => globalExitHandler('exit', e));
process.on('SIGUSR1', e => globalExitHandler('exit', e));
process.on('SIGUSR2', e => globalExitHandler('exit', e));
process.on('uncaughtException', e => globalExitHandler('uncaughtException', e));
