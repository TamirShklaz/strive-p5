"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sparky = void 0;
const env_1 = require("../env");
const FuseBoxLogAdapter_1 = require("../fuseLog/FuseBoxLogAdapter");
const utils_1 = require("../utils/utils");
const sparky_chain_1 = require("./sparky_chain");
let prettyTime = require('pretty-time');
function sparky(Ctx) {
    const ctx = new Ctx();
    const tasks = new Map();
    const log = FuseBoxLogAdapter_1.createFuseLogger({ level: 'verbose' });
    log.flush();
    const findTask = (name) => {
        for (const [key, value] of tasks.entries()) {
            if (typeof key === 'string' && key === name)
                return value;
            if (key instanceof RegExp && key.test(name))
                return value;
        }
        return null;
    };
    let execScheduled = false;
    const execNext = () => {
        if (!execScheduled) {
            const argv = process.argv;
            argv.splice(0, 2);
            let taskName = argv[0] || 'default';
            taskName = /^--/.test(taskName) ? 'default' : taskName;
            setTimeout(async () => {
                await scope.exec(taskName);
            }, 0);
        }
        execScheduled = true;
    };
    const times = {};
    const scope = {
        activities: [],
        exec: async (name) => {
            const task = findTask(name);
            if (!task) {
                log.error("Can't find task name: $name", { name });
                log.printBottomMessages();
                return;
            }
            times[name] = process.hrtime();
            log.info('<magenta>[ ' + name + ' ]</magenta>', 'Starting', { name });
            await task(ctx);
            log.info('<dim><magenta>[ ' + name + ' ]</magenta></dim>', '<dim>Completed in $time</dim>', {
                time: prettyTime(process.hrtime(times[name]), 'ms'),
            });
            log.printBottomMessages();
        },
        rm: (folder) => {
            utils_1.removeFolder(utils_1.ensureAbsolutePath(folder, env_1.env.SCRIPT_PATH));
        },
        src: (glob) => sparky_chain_1.sparkyChain(log).src(glob),
        task: (name, fn) => {
            tasks.set(name, fn);
            execNext();
        },
    };
    return scope;
}
exports.sparky = sparky;
