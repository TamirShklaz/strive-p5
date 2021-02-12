"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDevServer = exports.createExpressApp = void 0;
const express = require("express");
const http_proxy_middleware_1 = require("http-proxy-middleware");
const open = require("open");
const bundleRuntimeCore_1 = require("../bundleRuntime/bundleRuntimeCore");
const devServerProps_1 = require("./devServerProps");
const hmrServer_1 = require("./hmrServer");
function createExpressApp(ctx, props, extra) {
    const app = express();
    // app.all('/__ftl', (req, res) => {
    //   const ftlModules = ctx.assembleContext.getFTLModules();
    //   const js = generateFTLJavaScript(ftlModules);
    //   res.set('Content-Type', 'application/javascript; charset=UTF-8');
    //   res.send(js);
    // });
    if (props.express)
        props.express(app, express);
    function logProvider(p) {
        return {
            debug: (msg) => {
                ctx.log.info('proxy', msg);
            },
            error: (msg) => ctx.log.error(msg),
            info: (msg) => {
                ctx.log.info('proxy', msg);
            },
            log: (msg) => {
                ctx.log.info('proxy', msg);
            },
            warn: (msg) => ctx.log.warn(msg),
        };
    }
    if (extra && extra.proxyProps) {
        for (const item of extra.proxyProps) {
            item.options.logProvider = logProvider;
            app.use(item.path, http_proxy_middleware_1.createProxyMiddleware(item.options));
        }
    }
    app.use('/', express.static(props.root));
    app.use('*', (req, res) => {
        res.sendFile(props.fallback);
    });
    const server = app.listen(props.port, () => {
        if (extra && extra.openProps) {
            extra.openProps.target = extra.openProps.target || `http://localhost:${props.port}`;
            open(extra.openProps.target, extra.openProps);
        }
        ctx.log.clearLine();
        ctx.log.info('development', `Development server is running at <bold>http://localhost:$port</bold>`, {
            port: props.port,
        });
    });
    if (server) {
        server.on('error', (err) => {
            ctx.fatal('An error occurred while trying to start the devServer.', [err.message]);
        });
    }
    return server;
}
exports.createExpressApp = createExpressApp;
function createDevServer(ctx) {
    const ict = ctx.ict;
    const props = devServerProps_1.createDevServerConfig(ctx);
    if (!props.enabled) {
        return;
    }
    const httpServerProps = props.httpServer;
    const hmrServerProps = props.hmrServer;
    const isProduction = !!ctx.config.isProduction;
    let openProps;
    if (props.open) {
        if (typeof props.open === 'boolean') {
            openProps = {};
        }
        if (typeof props.open === 'object') {
            openProps = props.open;
        }
    }
    let proxyProps;
    if (props.proxy) {
        proxyProps = props.proxy;
    }
    // injecting some settings into the dev bundle
    if (hmrServerProps.enabled) {
        // injecting hmr dependency
        if (!isProduction) {
            const clientProps = {};
            if (hmrServerProps.connectionURL) {
                clientProps.connectionURL = hmrServerProps.connectionURL;
            }
            else {
                if (hmrServerProps.useCurrentURL || httpServerProps.port === hmrServerProps.port) {
                    clientProps.useCurrentURL = true;
                }
                else if (hmrServerProps.port) {
                    clientProps.port = hmrServerProps.port;
                }
            }
            ict.on('before_bundle_write', (props) => {
                const { bundle } = props;
                const bundleContext = ctx.bundleContext;
                if (bundle.containsApplicationEntryCall) {
                    let fuseBoxHotReload;
                    for (const absPath in bundleContext.modules) {
                        if (absPath.includes('fuse-box-hot-reload')) {
                            fuseBoxHotReload = bundleContext.modules[absPath];
                            break;
                        }
                    }
                    if (fuseBoxHotReload) {
                        const requireLine = 'const hmr = ' + bundleRuntimeCore_1.createGlobalModuleCall(fuseBoxHotReload.id);
                        bundle.source.injection.push(requireLine);
                        bundle.source.injection.push(`hmr.connect(${JSON.stringify(clientProps)})`);
                    }
                }
            });
        }
    }
    let hmrServerMethods;
    let onMessageCallbacks = [];
    ict.on('complete', (props) => {
        if (httpServerProps.enabled) {
            const internalServer = createExpressApp(ctx, httpServerProps, { openProps, proxyProps });
            // if the ports are the same, we mount HMR on the same server
            if (hmrServerProps.enabled && hmrServerProps.port === httpServerProps.port && !isProduction) {
                hmrServerMethods = hmrServer_1.createHMRServer({ ctx, internalServer, opts: hmrServerProps });
            }
        }
        if (hmrServerProps.enabled && !hmrServerMethods && !isProduction) {
            // which means that we require a separate HMR server on a different port
            hmrServerMethods = hmrServer_1.createHMRServer({ ctx, opts: hmrServerProps });
        }
        if (onMessageCallbacks.length && hmrServerMethods) {
            onMessageCallbacks.map((cb) => hmrServerMethods.onMessage(cb));
            onMessageCallbacks = [];
        }
        return props;
    });
    return {
        clientSend: (name, payload, ws_instance) => {
            if (hmrServerMethods) {
                hmrServerMethods.sendEvent(name, payload, ws_instance);
            }
        },
        onClientMessage: (fn) => {
            if (hmrServerMethods) {
                hmrServerMethods.onMessage(fn);
            }
            else {
                // if the server isn't ready store it here
                onMessageCallbacks.push(fn);
            }
        },
    };
}
exports.createDevServer = createDevServer;
