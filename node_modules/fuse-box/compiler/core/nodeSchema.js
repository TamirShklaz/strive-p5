"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSchema = void 0;
const helpers_1 = require("../helpers/helpers");
const AST_1 = require("../interfaces/AST");
const scopeTracker_1 = require("./scopeTracker");
function createSchema(props, context) {
    const { node, parent, property } = props;
    const state = {};
    function revisit(nodes) {
        if (!props.avoidReVisit) {
            for (const node of nodes)
                context.visit(Object.assign(Object.assign({}, props), { ignoreChildren: false, node: node }));
        }
    }
    const self = {
        context,
        state,
        bodyAppend: (nodes) => {
            context._append.push(nodes);
            return self;
        },
        bodyPrepend: (nodes) => {
            context._prepend.push(nodes);
            return self;
        },
        ensureESModuleStatement: (compilerOptions) => {
            if (compilerOptions.esModuleStatement && !context.esModuleStatementInjected) {
                context.esModuleStatementInjected = true;
                self.bodyPrepend([helpers_1.ES_MODULE_EXPRESSION]);
            }
            return self;
        },
        getLocal: (name) => {
            if (!self.nodeScope || self.nodeScope.length === 0)
                return;
            const total = self.nodeScope.length - 1;
            for (let i = total; i >= 0; i--) {
                const bodyScope = self.nodeScope[i];
                if (bodyScope[name] && bodyScope[name].node)
                    return bodyScope[name];
            }
            return undefined;
        },
        ignore: () => {
            self._childrenIgnored = true;
            return self;
        },
        insertAfter: (nodes) => {
            context._insert.push({ nodes, schema: self });
            revisit(nodes);
            return self;
        },
        remove: () => {
            context._remove.push(self);
            self._childrenIgnored = true;
            return self;
        },
        replace: (nodes, options) => {
            nodes = [].concat(nodes);
            context._replace.push({ nodes, schema: self });
            self._childrenIgnored = true;
            let stopPropagation = false;
            if (options) {
                if (options.stopPropagation)
                    stopPropagation = true;
                if (options.forceRevisit) {
                    for (const node of nodes)
                        context.visit(Object.assign(Object.assign({}, props), { ignoreChildren: false, node: node }));
                }
            }
            if (!stopPropagation)
                revisit(nodes);
            return self;
        },
    };
    for (const i in props)
        self[i] = props[i];
    if (props.avoidScope)
        return self;
    let scope = props.scope;
    if (!scope)
        scope = [];
    let bodyScope = scopeTracker_1.scopeTracker(self);
    let currentScope = [];
    if (bodyScope) {
        for (const x of scope)
            currentScope.push(x);
        currentScope.push(bodyScope);
    }
    else
        currentScope = scope;
    self.nodeScope = currentScope;
    // local identfier
    if (node.type === AST_1.ASTType.ObjectPattern) {
        for (const item of node.properties)
            item.$assign_pattern = true;
    }
    let shorthand;
    if (node.type === AST_1.ASTType.Property && node.shorthand === true && !node.$assign_pattern) {
        if (node.value && node.value.type === AST_1.ASTType.Identifier) {
            shorthand = node.value;
        }
    }
    const _isLocalIdentifier = helpers_1.isLocalIdentifier(node, parent, property);
    if (_isLocalIdentifier || shorthand) {
        let nodeName;
        if (shorthand)
            nodeName = shorthand.name;
        else
            nodeName = node.name;
        self.localIdentifier = { isShorthand: !!shorthand, name: nodeName };
    }
    return self;
}
exports.createSchema = createSchema;
