"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createVariableDeclaration = exports.createUndefinedVariable = exports.generateVariableFromSource = exports.generateModuleNameFromSource = void 0;
const path = require("path");
function generateModuleNameFromSource(source, sourceReferences) {
    let variable = path.basename(source).replace(/\.|-/g, '_');
    let index = 1;
    if (!/^[a-z]/i.test(variable))
        variable = 'a' + variable;
    // we have this variable already
    if (sourceReferences.hasOwnProperty(variable)) {
        index = sourceReferences[variable].current + 1;
        sourceReferences[variable].current = index;
        sourceReferences[variable].sources[source] = index;
    }
    else {
        sourceReferences[variable] = {
            current: index,
            sources: {
                [source]: index,
            },
        };
    }
    variable = variable + '_' + index;
    return variable;
}
exports.generateModuleNameFromSource = generateModuleNameFromSource;
function generateVariableFromSource(source, index) {
    let variable = path.basename(source).replace(/\.|-/g, '_') + '_' + index;
    if (!/^[a-z]/i.test(variable)) {
        variable = 'a' + variable;
    }
    return variable;
}
exports.generateVariableFromSource = generateVariableFromSource;
function createUndefinedVariable(name) {
    return {
        definite: false,
        id: {
            name: name,
            optional: false,
            type: 'Identifier',
        },
        init: null,
        type: 'VariableDeclarator',
    };
}
exports.createUndefinedVariable = createUndefinedVariable;
function createVariableDeclaration() {
    return {
        declarations: [],
        kind: 'var',
        type: 'VariableDeclaration',
    };
}
exports.createVariableDeclaration = createVariableDeclaration;
