"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var t = __importStar(require("@babel/types"));
var KEYWORD = 'stub';
function getStubValue(comments) {
    var regExp = new RegExp("@" + KEYWORD + " (.*)");
    var comment = comments.find(function (comment) { return regExp.test(comment.value); });
    if (!comment) {
        return null;
    }
    var _a = comment.value.match(regExp) || [], _ = _a[0], value = _a[1];
    // 清除 comment 标记，避免重复执行
    comment.value = ' stub-next-line';
    if (!value) {
        return null;
    }
    return value.trim();
}
function createStubValueNode(stubValue) {
    var stubValueType = eval("typeof " + stubValue);
    switch (stubValueType) {
        case 'string':
            return t.stringLiteral(stubValue.substr(1, stubValue.length - 2));
        case 'undefined':
            return t.identifier('undefined');
        case 'number':
            return t.numericLiteral(Number(stubValue));
        case 'boolean':
            return t.booleanLiteral(Boolean(stubValue));
        case 'object':
            if (stubValue === 'null') {
                return t.nullLiteral();
            }
    }
    console.error("\u4E0D\u652F\u6301 : " + stubValue);
}
function stub() {
    return {
        visitor: {
            Program: function (path) {
                path.traverse({
                    enter: function (path) {
                        var node = path.node, parent = path.parent;
                        var comments = __spreadArrays((node.leadingComments || []), (node.innerComments || []), (node.trailingComments || []));
                        var stubValue = getStubValue(comments);
                        if (!stubValue) {
                            return;
                        }
                        var stubValueNode = createStubValueNode(stubValue);
                        if (!stubValueNode) {
                            return;
                        }
                        /**
                         * fn(
                         *   // @stub 'stub value'
                         *   variable
                         * )
                         *
                         */
                        if (t.isIdentifier(node)) {
                            path.replaceWith(stubValueNode);
                            return;
                        }
                        /**
                         * fn(
                         *   // @stub 'stub value'
                         *   'value'
                         * )
                         *
                         */
                        if (t.isLiteral(node)) {
                            path.replaceWith(stubValueNode);
                            return;
                        }
                        /**
                         * // @stub 'stub value'
                         * const variable = 'value';
                         */
                        if (t.isVariableDeclaration(node) && node.declarations.length === 1) {
                            var declaration = node.declarations[0];
                            declaration.init = stubValueNode;
                            return;
                        }
                        /**
                         * const variable = {
                         *   // @stub 'stub value'
                         *   property: 'value'
                         * }
                         */
                        if (t.isObjectProperty(node)) {
                            node.value = stubValueNode;
                            return;
                        }
                        /**
                         * // @stub 'stub value'
                         * variable = 'value'
                         */
                        if (t.isExpressionStatement(node) &&
                            t.isAssignmentExpression(node.expression)) {
                            node.expression.right = stubValueNode;
                            return;
                        }
                        /**
                         * // @stub 'stub value'
                         * variable
                         */
                        if (t.isExpressionStatement(node) && t.isIdentifier(node.expression)) {
                            node.expression = t.assignmentExpression('=', node.expression, stubValueNode);
                            return;
                        }
                        /**
                         * // @stub 'stub value'
                         * if (...) {
                         * }
                         */
                        if (t.isIfStatement(node)) {
                            node.test = stubValueNode;
                            return;
                        }
                        /**
                         * if (...) {
                         * // @stub 'stub value'
                         * } else if (...) {
                         * }
                         */
                        if (t.isBlockStatement(node) &&
                            t.isIfStatement(parent) &&
                            t.isIfStatement(parent.alternate)) {
                            parent.alternate.test = stubValueNode;
                            return;
                        }
                        /**
                         * // @stub 'stub value'
                         * return 'value';
                         */
                        if (t.isReturnStatement(node)) {
                            node.argument = stubValueNode;
                            return;
                        }
                        if (t.isExportNamedDeclaration(node) &&
                            t.isVariableDeclaration(node.declaration)) {
                            if (node.declaration.declarations.length !== 1) {
                                return;
                            }
                            var declaration = node.declaration.declarations[0];
                            /**
                             * // @stub 'stub value'
                             * export const variable = 'value';
                             */
                            if (t.isIdentifier(declaration.init) || t.isLiteral(declaration.init)) {
                                declaration.init = stubValueNode;
                                return;
                            }
                            return;
                        }
                    },
                });
            },
        },
    };
}
exports.default = stub;
