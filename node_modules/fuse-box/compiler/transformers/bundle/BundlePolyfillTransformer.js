"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BundlePolyfillTransformer = exports.PolyfillEssentialConfig = void 0;
const path = require("path");
const utils_1 = require("../../../utils/utils");
const helpers_1 = require("../../helpers/helpers");
const ImportType_1 = require("../../interfaces/ImportType");
exports.PolyfillEssentialConfig = {
    Buffer: 'buffer',
    __dirname: '__dirname',
    __filename: '__filename',
    buffer: 'buffer',
    global: 'global',
    http: 'http',
    https: 'https',
    process: 'process',
    stream: 'stream',
};
function BundlePolyfillTransformer() {
    return {
        commonVisitors: props => {
            const { transformationContext: { compilerOptions, module: { publicPath }, }, } = props;
            const isBrowser = compilerOptions.buildTarget === 'browser';
            const isWebWorker = compilerOptions.buildTarget === 'web-worker';
            if (!(isBrowser || isWebWorker))
                return;
            const VariablesInserted = {};
            const RequireStatementsInserted = {};
            const dirName = utils_1.ensureFuseBoxPath(path.dirname(publicPath));
            return {
                onEach: (schema) => {
                    const { getLocal, localIdentifier, node, replace } = schema;
                    if (localIdentifier) {
                        const name = node.name;
                        /**
                         * *********************************************************************************
                         * Polyfills stream buffer e.t.c
                         */
                        if (exports.PolyfillEssentialConfig[name]) {
                            if (getLocal(name)) {
                                return;
                            }
                            switch (name) {
                                case '__dirname':
                                    return replace({ type: 'Literal', value: publicPath });
                                case '__filename':
                                    return replace({ type: 'Literal', value: dirName });
                                case 'global':
                                    return replace({ name: isWebWorker ? 'self' : 'window', type: 'Identifier' });
                            }
                            if (VariablesInserted[name])
                                return;
                            VariablesInserted[name] = 1;
                            const statements = [];
                            const moduleName = exports.PolyfillEssentialConfig[name];
                            if (!RequireStatementsInserted[moduleName]) {
                                RequireStatementsInserted[moduleName] = 1;
                                const statement = helpers_1.createRequireStatement(moduleName, moduleName);
                                if (props.onRequireCallExpression)
                                    props.onRequireCallExpression(ImportType_1.ImportType.REQUIRE, statement.reqStatement);
                                statements.push(statement.statement);
                            }
                            if (name !== moduleName) {
                                statements.push({
                                    declarations: [
                                        {
                                            id: {
                                                name: name,
                                                type: 'Identifier',
                                            },
                                            init: {
                                                name: moduleName,
                                                type: 'Identifier',
                                            },
                                            type: 'VariableDeclarator',
                                        },
                                    ],
                                    kind: 'var',
                                    type: 'VariableDeclaration',
                                });
                            }
                            if (statements.length) {
                                return schema.bodyPrepend(statements);
                            }
                        }
                    }
                    return;
                },
            };
        },
    };
}
exports.BundlePolyfillTransformer = BundlePolyfillTransformer;
