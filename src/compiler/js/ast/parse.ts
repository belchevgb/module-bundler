import * as ts from "typescript";
import { JsModule, JsModuleLibs } from "../module";
import { INTERNAL_REQUIRE_FN_NAME, visitEachNode } from "./utils";
import { printNode, printNodeKind } from "./debug";

export function parseModule(module: JsModule) {
    return ts.createSourceFile(module.fileName, module.content, ts.ScriptTarget.Latest);
}

export function getModuleLib(module: JsModule) {
    const content = (module.content as string);
    
    if (content.includes("__esModule")) {
        return JsModuleLibs.cjs;
    }

    if (content.includes(INTERNAL_REQUIRE_FN_NAME)) {
        return JsModuleLibs.internal;
    }
}

function tryGetModulePath(node: ts.Node) {
    if (node.kind !== ts.SyntaxKind.CallExpression) {
        return null;
    }

    const callExpr = node as ts.CallExpression;
    const expr = callExpr.expression;
    const isRequireCall = ts.isIdentifier(expr) && expr.text === INTERNAL_REQUIRE_FN_NAME && callExpr.arguments.length === 1 && ts.isStringLiteral(callExpr.arguments[0]);

    if (!isRequireCall) {
        return null;
    }

    const importPath = (callExpr.arguments[0] as ts.StringLiteral).text;
    return importPath;
}

export function getImportedModulePaths(module: JsModule) {
    const imports: string[] = [];
    
    visitEachNode(module.ast, n => {
        const maybeImportPath = tryGetModulePath(n);
        if (maybeImportPath !== null) {
            imports.push(maybeImportPath);
        }
    });

    return imports;
}
