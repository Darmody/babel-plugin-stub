import * as t from '@babel/types';
import { Visitor } from '@babel/traverse';

const KEYWORD = 'stub';

function getStubValue(comments: readonly t.Comment[]) {
  const regExp = new RegExp(`@${KEYWORD} (.*)`);
  const comment = comments.find(comment => regExp.test(comment.value));

  if (!comment) {
    return null;
  }

  const [_, value] = comment.value.match(regExp) || [];

  // clear the comment for preventing from recursive
  comment.value = ' stub-next-line';

  if (!value) {
    return null;
  }

  return value.trim();
}

function createStubValueNode(stubValue: string) {
  const stubValueType = eval(`typeof ${stubValue}`);

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

  console.error(`"${stubValue}" is not support yet.`);
}

export default function stub(): { visitor: Visitor } {
  return {
    visitor: {
      Program: path => {
        path.traverse({
          enter(path) {
            const { node, parent } = path;
            const comments = [
              ...(node.leadingComments || []),
              ...(node.innerComments || []),
              ...(node.trailingComments || []),
            ];
            const stubValue = getStubValue(comments);

            if (!stubValue) {
              return;
            }

            const stubValueNode = createStubValueNode(stubValue);

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
              const declaration = node.declarations[0];

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
            if (
              t.isExpressionStatement(node) &&
              t.isAssignmentExpression(node.expression)
            ) {
              node.expression.right = stubValueNode;
              return;
            }

            /**
             * // @stub 'stub value'
             * variable
             */
            if (t.isExpressionStatement(node) && t.isIdentifier(node.expression)) {
              node.expression = t.assignmentExpression(
                '=',
                node.expression,
                stubValueNode
              );
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
            if (
              t.isBlockStatement(node) &&
              t.isIfStatement(parent) &&
              t.isIfStatement(parent.alternate)
            ) {
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

            if (
              t.isExportNamedDeclaration(node) &&
              t.isVariableDeclaration(node.declaration)
            ) {
              if (node.declaration.declarations.length !== 1) {
                return;
              }

              const declaration = node.declaration.declarations[0];

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
