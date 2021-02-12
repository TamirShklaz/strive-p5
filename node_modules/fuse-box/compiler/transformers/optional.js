"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCoreTransformer = exports.createCoreTransformerOption = void 0;
const CSSinJSXTransformer_1 = require("./shared/CSSinJSXTransformer");
const AngularURLTransformer_1 = require("./ts/AngularURLTransformer");
const OptionalCoreTransformers = {
    angular: {
        options: { name: 'angular' },
        transformer: AngularURLTransformer_1.AngularURLTransformer,
    },
    css_in_jsx: {
        options: { name: 'css_in_jsx' },
        transformer: CSSinJSXTransformer_1.CSSInJSXTransformer,
    },
};
function createCoreTransformerOption(name, opts) {
    if (OptionalCoreTransformers[name]) {
        const record = OptionalCoreTransformers[name];
        return { name: record.options.name, opts };
    }
}
exports.createCoreTransformerOption = createCoreTransformerOption;
function getCoreTransformer(props) {
    if (props.transformer)
        return props.transformer(props.opts);
    if (props.name) {
        const target = OptionalCoreTransformers[props.name];
        if (target) {
            return target.transformer(props.opts);
        }
    }
    else if (props.script) {
        const transformerModule = require(props.script);
        if (transformerModule.default) {
            return transformerModule.default(props.opts);
        }
    }
}
exports.getCoreTransformer = getCoreTransformer;
