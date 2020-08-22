import ts = require("typescript");
import { JsModule } from "../../../module";

// removes Object.defineProperty(exports, "__esModule", { value: true });
function cjsRemoveDefine__esModuleTransformer<T extends ts.Node>(): ts.TransformerFactory<T> {
    return context => {
        const visit: ts.Visitor = n => {
            const defaultResult = () => ts.visitEachChild(n, child => visit(child), context);

            if (!ts.isExpressionStatement(n)) {
                return defaultResult();
            }

            // Verify the expression is an function call
            const callExpression = n.expression;
            if (!ts.isCallExpression(callExpression)) {
                return defaultResult();
            }

            // Verify that the called function is on given object
            if (!ts.isPropertyAccessExpression(callExpression.expression)) {
                return defaultResult();
            }

            // Verify the accssed object is Object
            const acessedObjectExpression = callExpression.expression.expression;
            if (!ts.isIdentifier(acessedObjectExpression) || acessedObjectExpression.text !== "Object") {
                return defaultResult();
            }

            // Verify the called method on Object is defineProperty
            const invokedMethod = callExpression.expression.name;
            if (invokedMethod.text !== "defineProperty") {
                return defaultResult();
            }

            const args = callExpression.arguments;

            // Verify the target object is exports
            if (!ts.isIdentifier(args[0]) || (args[0] as ts.Identifier).text !== "exports") {
                return defaultResult();
            }

            // Verify the defined property is __esModule
            if (!ts.isStringLiteral(args[1]) || (args[1] as ts.StringLiteral).text !== "__esModule") {
                return defaultResult();
            }

            return undefined;
        };

        return node => ts.visitNode(node, visit);
    };
}

function requireCallsTransformer<T extends ts.Node>(): ts.TransformerFactory<T> {
    return context => {
        const visit: ts.Visitor = n => {
            if (ts.isCallExpression(n) &&
                n.kind === ts.SyntaxKind.CallExpression &&
                (ts.isIdentifier(n.expression)) &&
                n.expression.text === "require" &&
                n.arguments.length === 1 &&
                ts.isStringLiteral(n.arguments[0])) {
                    const argText = (n.arguments[0] as ts.StringLiteral).text;
                    return ts.createCall(
                        ts.createIdentifier("__internalRequire"),
                        null,
                        [ts.createStringLiteral(argText)]
                    );
            }

            return ts.visitEachChild(n, visit, context);
        };

        return node => ts.visitNode(node, visit);
    };
}

function exportsTransformer<T extends ts.Node>(): ts.TransformerFactory<T> {
    return context => {
        const visit: ts.Visitor = n => {
            if (ts.isPropertyAccessExpression(n) && ts.isIdentifier(n.expression) && n.expression.text === "exports") {
                return ts.createPropertyAccess(
                    ts.createIdentifier("__exportedMembers"),
                    ts.createIdentifier(n.name.text)
                )
            }

            return ts.visitEachChild(n, visit, context);
        };

        return node => ts.visitNode(node, visit);
    };
}

export function transformCjsModule(module: JsModule) {
    const transformResult = ts.transform(module.ast, [cjsRemoveDefine__esModuleTransformer(), requireCallsTransformer(), exportsTransformer()]);
    module.ast = transformResult.transformed[0];
}