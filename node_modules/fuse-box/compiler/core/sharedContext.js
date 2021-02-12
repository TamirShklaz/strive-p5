"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSharedContext = exports.SharedContext = void 0;
const astHelpers_1 = require("../helpers/astHelpers");
const helpers_1 = require("../helpers/helpers");
const AST_1 = require("../interfaces/AST");
const transformModule_1 = require("./transformModule");
const REF_ALLOWED = {
    [AST_1.ASTType.ImportDefaultSpecifier]: 1,
    [AST_1.ASTType.ImportNamespaceSpecifier]: 1,
    [AST_1.ASTType.ImportSpecifier]: 1,
};
class SharedContext {
    constructor(props) {
        this.props = props;
        this.localRefListeners = new Map();
        this.onCompleteCallbacks = [];
        this.variableCounter = 0;
        this.esModuleStatementInjected = false;
        this.moduleExportsName = 'exports';
        // main visit function
        this.visit = this.props.visitFn;
        this.sourceReferences = {};
        this.fork = (props) => {
            const options = this.props.rootProps.visitorProps;
            transformModule_1.transformModule(Object.assign(Object.assign({}, options), props));
        };
        this.getNextSystemVariable = () => `_${[++this.variableCounter]}_`;
        this.coreReplacements = {};
        this._replace = [];
        this._insert = [];
        this._remove = [];
        this._prepend = [];
        this._append = [];
        this.onRef = (name, fn) => {
            let list = this.localRefListeners.get(name);
            if (!list) {
                list = [];
                this.localRefListeners.set(name, list);
            }
            list.push(fn);
        };
        this.onComplete = (fn, priority) => {
            if (priority !== undefined) {
                this.onCompleteCallbacks.splice(priority, 0, fn);
            }
            else
                this.onCompleteCallbacks.push(fn);
        };
        this.finalize = () => {
            for (const complete of this.onCompleteCallbacks)
                complete();
        };
        this.transform = () => {
            const programBody = this.props.root.body;
            for (const item of this._replace) {
                const { node, parent, property } = item.schema;
                if (property && parent) {
                    if (parent[property] instanceof Array) {
                        const index = parent[property].indexOf(node);
                        if (index > -1) {
                            parent[property].splice(index, 1, ...item.nodes);
                        }
                    }
                    else {
                        parent[property] = item.nodes[0];
                    }
                }
            }
            for (const item of this._insert) {
                const { node, parent, property } = item.schema;
                if (property && parent) {
                    if (parent[property] instanceof Array) {
                        const index = parent[property].indexOf(node);
                        if (index > -1)
                            parent[property].splice(index + 1, 0, ...item.nodes);
                    }
                    else
                        parent[property] = item.nodes[0];
                }
            }
            for (const item of this._remove) {
                const { node, parent, property } = item;
                if (property && parent) {
                    if (parent[property] instanceof Array) {
                        const index = parent[property].indexOf(node);
                        if (index > -1)
                            parent[property].splice(index, 1);
                    }
                }
            }
            let index = 0;
            while (index < this._prepend.length) {
                programBody.splice(index, 0, ...this._prepend[index]);
                index++;
            }
            for (const item of this._append) {
                for (const c of item)
                    programBody.push(c);
            }
            this._append = [];
            this._insert = [];
            this._prepend = [];
            this._remove = [];
            this._replace = [];
        };
    }
    getModuleName(source) {
        return astHelpers_1.generateModuleNameFromSource(source, this.sourceReferences);
    }
    preAct(schema) {
        const localIdentifier = schema.localIdentifier;
        if (localIdentifier) {
            const { replace } = schema;
            const listeners = this.localRefListeners.get(localIdentifier.name);
            if (listeners) {
                for (const listener of listeners)
                    listener(schema);
            }
            // core replacements
            // related to Import and Export transformer
            const traced = this.coreReplacements[localIdentifier.name];
            if (traced && traced.first) {
                const origin = schema.getLocal(localIdentifier.name);
                if (!origin || (origin && REF_ALLOWED[origin.node.type])) {
                    traced.inUse = true;
                    if (traced.first === localIdentifier.name) {
                        return;
                    }
                    const statement = traced.second
                        ? helpers_1.createMemberExpression(traced.first, traced.second)
                        : { name: traced.first, type: 'Identifier' };
                    if (localIdentifier.isShorthand) {
                        schema.node.shorthand = false;
                        schema.node.value = statement;
                        return replace(schema.node);
                    }
                    if (statement.object)
                        statement.object.loc = schema.node.loc;
                    return replace(statement);
                }
            }
        }
    }
}
exports.SharedContext = SharedContext;
function createSharedContext(props) {
    return new SharedContext(props);
}
exports.createSharedContext = createSharedContext;
