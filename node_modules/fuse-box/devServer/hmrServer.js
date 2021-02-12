"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createHMRServer = exports.createClient = void 0;
const ws_1 = require("ws");
// keep that in mind:
// https://github.com/elsassph/react-hmr-ts/tree/master/examples/fuse-box
function createClient(client) {
    return {
        getClient() {
            return client;
        },
        sendEvent(name, payload) {
            client.send(JSON.stringify({ name, payload }));
        },
    };
}
exports.createClient = createClient;
function createHMRServer(props) {
    const serverOpts = {};
    const ctx = props.ctx;
    if (props.internalServer) {
        serverOpts.server = props.internalServer;
    }
    else {
        serverOpts.port = props.opts.port;
    }
    const wss = new ws_1.Server(serverOpts);
    const clients = new Set();
    const scope = {
        listeners: [],
    };
    ctx.log.info('development', 'HMR server is running on port $port', { port: props.opts.port });
    wss.on('connection', function connection(ws) {
        const client = createClient(ws);
        clients.add(client);
        ws.on('close', () => {
            clients.delete(client);
        });
        ws.on('message', function incoming(data) {
            const json = JSON.parse(data);
            scope.listeners.forEach(fn => {
                fn(json.name, json.payload, this);
            });
        });
    });
    return {
        getClient: () => {
            return null;
        },
        onMessage: (fn) => {
            scope.listeners.push(fn);
        },
        sendEvent: (name, payload, ws_instance) => {
            if (ws_instance) {
                // if ws_instance then just respond to it
                clients.forEach(client => {
                    if (client.getClient() === ws_instance) {
                        client.sendEvent(name, payload, ws_instance);
                    }
                });
            }
            else {
                clients.forEach(client => client.sendEvent(name, payload, ws_instance));
            }
        },
    };
}
exports.createHMRServer = createHMRServer;
