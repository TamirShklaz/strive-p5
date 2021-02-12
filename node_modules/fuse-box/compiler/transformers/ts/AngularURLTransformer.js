"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AngularURLTransformer = void 0;
const helpers_1 = require("../../helpers/helpers");
const ImportType_1 = require("../../interfaces/ImportType");
const PropKeys = { styleUrls: 'styles', templateUrl: 'template' };
function AngularURLTransformer(test) {
    return {
        target: { test: test },
        commonVisitors: props => {
            return {
                onEach: (schema) => {
                    const { node } = schema;
                    if (node.type === 'Property') {
                        if (PropKeys[node.key.name]) {
                            const value = node.value;
                            let keyTransformRequired = false;
                            // transform styleUrls
                            if (value.type === 'ArrayExpression') {
                                let i = 0;
                                while (i < value.elements.length) {
                                    const el = value.elements[i];
                                    if (el.type === 'Literal') {
                                        keyTransformRequired = true;
                                        const req = helpers_1.createRequireCallExpression([{ type: 'Literal', value: el.value }]);
                                        // emit require statement
                                        if (props.onRequireCallExpression) {
                                            props.onRequireCallExpression(ImportType_1.ImportType.REQUIRE, req, { breakDependantsCache: true });
                                        }
                                        value.elements[i] = req;
                                    }
                                    i++;
                                }
                            }
                            // transform templateUrl
                            else if (value.type === 'Literal') {
                                keyTransformRequired = true;
                                node.value = helpers_1.createRequireCallExpression([value]);
                                // emit require statement
                                if (props.onRequireCallExpression)
                                    props.onRequireCallExpression(ImportType_1.ImportType.REQUIRE, node.value);
                            }
                            if (keyTransformRequired)
                                node.key.name = PropKeys[node.key.name];
                        }
                    }
                    return;
                },
            };
        },
    };
}
exports.AngularURLTransformer = AngularURLTransformer;
