"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformModule = void 0;
const nodeVisitor_1 = require("./nodeVisitor");
function transformModule(props) {
    const eachNodeTransformers = [];
    const eachProgamBodyTransformers = [];
    //console.log(JSON.stringify(props.ast, null, 2));
    for (const t of props.transformers) {
        if (t) {
            if (typeof t === 'object') {
                if (t.onEach)
                    eachNodeTransformers.push(t.onEach);
                if (t.onProgramBody)
                    eachProgamBodyTransformers.push(t.onProgramBody);
            }
            else {
                eachNodeTransformers.push(t);
            }
        }
    }
    nodeVisitor_1.nodeVisitor({
        ast: props.root,
        contextOverrides: props.contextOverrides,
        visitorProps: props,
        fn: scope => {
            for (const transformer of eachNodeTransformers) {
                if (transformer(scope))
                    return;
            }
        },
        programBodyFn: scope => {
            for (const transformer of eachProgamBodyTransformers) {
                if (transformer(scope))
                    return;
            }
        },
    });
}
exports.transformModule = transformModule;
