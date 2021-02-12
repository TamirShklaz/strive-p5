"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformCommonVisitors = exports.registerTransformer = exports.isTransformerEligible = exports.BASE_TRANSFORMERS = exports.USER_CUSTOM_TRANSFORMERS = void 0;
const path = require("path");
const extensions_1 = require("../config/extensions");
const transformModule_1 = require("./core/transformModule");
const BrowserProcessTransformer_1 = require("./transformers/bundle/BrowserProcessTransformer");
const BuildEnvTransformer_1 = require("./transformers/bundle/BuildEnvTransformer");
const BundleFastConditionTransformer_1 = require("./transformers/bundle/BundleFastConditionTransformer");
const BundlePolyfillTransformer_1 = require("./transformers/bundle/BundlePolyfillTransformer");
const RequireStatementInterceptor_1 = require("./transformers/bundle/RequireStatementInterceptor");
const NullishCoalescingTransformer_1 = require("./transformers/nullishCoalescing/NullishCoalescingTransformer");
const optional_1 = require("./transformers/optional");
const OptionalChainingTransformer_1 = require("./transformers/optionalChaining/OptionalChainingTransformer");
const DynamicImportTransformer_1 = require("./transformers/shared/DynamicImportTransformer");
const ExportTransformer_1 = require("./transformers/shared/ExportTransformer");
const ImportTransformer_1 = require("./transformers/shared/ImportTransformer");
const JSXTransformer_1 = require("./transformers/shared/JSXTransformer");
const ClassConstructorPropertyTransformer_1 = require("./transformers/ts/ClassConstructorPropertyTransformer");
const CommonTSfeaturesTransformer_1 = require("./transformers/ts/CommonTSfeaturesTransformer");
const EnumTransformer_1 = require("./transformers/ts/EnumTransformer");
const NameSpaceTransformer_1 = require("./transformers/ts/NameSpaceTransformer");
const DecoratorTransformer_1 = require("./transformers/ts/decorators/DecoratorTransformer");
exports.USER_CUSTOM_TRANSFORMERS = {};
/**
 * Order of those transformers MATTER!
 */
exports.BASE_TRANSFORMERS = [
    BuildEnvTransformer_1.BuildEnvTransformer(),
    NullishCoalescingTransformer_1.NullishCoalescingTransformer(),
    OptionalChainingTransformer_1.OptionalChaningTransformer(),
    BundleFastConditionTransformer_1.BundleFastConditionUnwrapper(),
    DecoratorTransformer_1.DecoratorTransformer(),
    RequireStatementInterceptor_1.RequireStatementInterceptor(),
    BrowserProcessTransformer_1.BrowserProcessTransformer(),
    BundlePolyfillTransformer_1.BundlePolyfillTransformer(),
    DynamicImportTransformer_1.DynamicImportTransformer(),
    EnumTransformer_1.EnumTransformer(),
    ClassConstructorPropertyTransformer_1.ClassConstructorPropertyTransformer(),
    JSXTransformer_1.JSXTransformer(),
    NameSpaceTransformer_1.NamespaceTransformer(),
    // must be before export/import
    CommonTSfeaturesTransformer_1.CommonTSfeaturesTransformer(),
    ImportTransformer_1.ImportTransformer(),
    ExportTransformer_1.ExportTransformer(),
];
function isTransformerEligible(absPath, transformer) {
    const isTypescript = extensions_1.TS_EXTENSIONS.includes(path.extname(absPath));
    if (transformer.target) {
        if (transformer.target.type) {
            if (transformer.target.type === 'js_ts')
                return true;
            if (transformer.target.type === 'js' && !isTypescript)
                return true;
            if (transformer.target.type === 'ts' && isTypescript)
                return true;
        }
        else if (transformer.target.test) {
            return transformer.target.test.test(absPath);
        }
        return false;
    }
    return true;
}
exports.isTransformerEligible = isTransformerEligible;
function registerTransformer(name, transformer) {
    exports.USER_CUSTOM_TRANSFORMERS[name] = transformer;
}
exports.registerTransformer = registerTransformer;
function transformCommonVisitors(props, ast) {
    const requireStatementCollection = [];
    function onRequireCallExpression(importType, statement, moduleOptions) {
        // making sure we have haven't emitted the same property twice
        if (!statement['emitted']) {
            Object.defineProperty(statement, 'emitted', { enumerable: false, value: true });
            requireStatementCollection.push({ importType, moduleOptions, statement });
        }
    }
    const compilerOptions = props.compilerOptions;
    const userTransformers = [];
    for (const transformerOption of compilerOptions.transformers) {
        userTransformers.push(optional_1.getCoreTransformer(transformerOption));
    }
    const commonVisitors = [];
    let index = 0;
    const visitorProps = { onRequireCallExpression, transformationContext: props };
    while (index < exports.BASE_TRANSFORMERS.length) {
        const transformer = exports.BASE_TRANSFORMERS[index];
        // user transformer need to be executed after the first transformers
        if (index === 1) {
            for (const userTransformer of userTransformers) {
                if (userTransformer.commonVisitors && isTransformerEligible(props.module.absPath, userTransformer))
                    commonVisitors.push(userTransformer.commonVisitors(visitorProps));
            }
        }
        if (transformer.commonVisitors && isTransformerEligible(props.module.absPath, transformer))
            commonVisitors.push(transformer.commonVisitors(visitorProps));
        index++;
    }
    transformModule_1.transformModule({ root: ast, transformers: commonVisitors });
    return { ast, requireStatementCollection };
}
exports.transformCommonVisitors = transformCommonVisitors;
