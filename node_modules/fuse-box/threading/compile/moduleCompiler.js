"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.moduleCompiler = void 0;
const sourceMapModule = require("source-map");
const bundleRuntimeCore_1 = require("../../bundleRuntime/bundleRuntimeCore");
const generator_1 = require("../../compiler/generator/generator");
const parser_1 = require("../../compiler/parser");
const transformer_1 = require("../../compiler/transformer");
const extensions_1 = require("../../config/extensions");
const package_1 = require("../../moduleResolver/package");
const utils_1 = require("../../utils/utils");
async function moduleCompiler(props) {
    try {
        const { context: { compilerOptions, config, module }, } = props;
        const ast = props.ast || getAST(props);
        //console.log(JSON.stringify(ast, null, 2));
        const result = transformer_1.transformCommonVisitors(props.context, ast);
        const tasks = [];
        const target = compilerOptions.buildTarget;
        for (const item of result.requireStatementCollection) {
            if (!item.statement.arguments[0]) {
                props.onError(`Empty require detected ${item.statement}`);
            }
            else if (item.statement.arguments.length === 1) {
                if (typeof item.statement.arguments[0].value === 'string') {
                    const source = item.statement.arguments[0].value;
                    tasks.push({ item: item, promise: props.onResolve({ importType: item.importType, source }), source });
                }
                else {
                    if (compilerOptions.buildTarget === 'browser') {
                        props.onError(`Invalid import. Should recieve a string. ${props.absPath}`);
                    }
                }
            }
        }
        const promises = [];
        for (const x of tasks)
            promises.push(x.promise);
        const results = await Promise.all(promises);
        let index = 0;
        const canIgnoreModules = (target === 'electron' && config.electron.nodeIntegration) || target === 'server';
        while (index < tasks.length) {
            const task = tasks[index];
            const item = task.item;
            const response = results[index];
            if (response.id) {
                item.statement.callee.name = bundleRuntimeCore_1.BUNDLE_RUNTIME_NAMES.ARG_REQUIRE_FUNCTION;
                item.statement.arguments = [
                    {
                        type: 'Literal',
                        value: response.id,
                    },
                ];
            }
            else if (!canIgnoreModules) {
                item.statement.callee.name = bundleRuntimeCore_1.BUNDLE_RUNTIME_NAMES.ARG_REQUIRE_FUNCTION;
            }
            index++;
        }
        const response = {};
        if (props.generateCode) {
            const genOptions = {
                ecmaVersion: 7,
            };
            if (module.isSourceMapRequired) {
                const sourceMap = new sourceMapModule.SourceMapGenerator({
                    file: module.publicPath,
                });
                genOptions.sourceMap = sourceMap;
            }
            // if (self.ctx.config.isProduction) {
            //   genOptions.indent = '';
            //   genOptions.lineEnd = '';
            // }
            response.contents = generator_1.generate(ast, genOptions);
            if (module.isSourceMapRequired) {
                const jsonSourceMaps = genOptions.sourceMap.toJSON();
                if (!jsonSourceMaps.sourcesContent) {
                    delete jsonSourceMaps.file;
                    jsonSourceMaps.sources = [target === 'server' ? module.absPath : module.publicPath];
                    if (target !== 'server')
                        jsonSourceMaps.sourcesContent = [props.contents];
                }
                response.sourceMap = JSON.stringify(jsonSourceMaps);
            }
        }
        props.onReady(response);
    }
    catch (e) {
        props.onFatal(e);
    }
}
exports.moduleCompiler = moduleCompiler;
function getAST(props) {
    let parser;
    let contents = props.contents;
    if (!contents && props.absPath) {
        contents = utils_1.readFile(props.absPath);
    }
    const { context: { compilerOptions, module, pkg }, } = props;
    if (extensions_1.TS_EXTENSIONS.includes(module.extension))
        parser = parser_1.parseTypeScript;
    else {
        parser = parser_1.parseJavascript;
        const parserOptions = compilerOptions.jsParser;
        const isExternal = pkg.type === package_1.PackageType.EXTERNAL_PACKAGE;
        if (isExternal) {
            if (parserOptions.nodeModules === 'ts')
                parser = parser_1.parseTypeScript;
        }
        else if (parserOptions.project === 'ts')
            parser = parser_1.parseTypeScript;
    }
    const jsxRequired = module.extension !== '.ts';
    let ast;
    try {
        ast = parser(contents, {
            jsx: jsxRequired,
            locations: module.isSourceMapRequired,
        });
    }
    catch (e) {
        let line = '';
        if (e.lineNumber && e.column) {
            line = `:${e.lineNumber}:${e.column}`;
        }
        props.onError(`Error while parsing module ${props.absPath}${line}\n\t' ${e.stack || e.message}`);
        ast = parser_1.parseJavascript(``);
    }
    return ast;
}
