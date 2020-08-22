import * as ts from "typescript";
import { JsModule, JsModuleLibs } from "../module";

export function parseModule(module: JsModule) {
    return ts.createSourceFile(module.fileName, module.content, ts.ScriptTarget.Latest);
}

export function getModuleLib(module: JsModule) {
    const content = (module.content as string);
    
    if (content.includes("__esModule")) {
        return JsModuleLibs.cjs;
    }

    if (content.includes("__internalRequire")) {
        return JsModuleLibs.internal;
    }
}

function tryGetRequireImportPath(node: ts.Node) {
    if (node.kind !== ts.SyntaxKind.CallExpression) {
        return null;
    }

    const callExpr = node as ts.CallExpression;
    const expr = callExpr.expression;
    const isRequireCall = ts.isIdentifier(expr) && expr.text === "require" && callExpr.arguments.length === 1 && ts.isStringLiteral(callExpr.arguments[0]);

    if (!isRequireCall) {
        return null;
    }

    const importPath = (callExpr.arguments[0] as ts.StringLiteral).text;
    return importPath;
}

function extractCjsModuleImports(module: JsModule): string[] {
    const imports: string[] = [];
    
    function walkAst(node: ts.Node) {
        const maybeImportPath = tryGetRequireImportPath(node);
        if (maybeImportPath !== null) {
            imports.push(maybeImportPath);
        }

        ts.forEachChild(node, walkAst);
    }

    walkAst(module.ast);

    return imports;
}

export function getImportedModulePaths(module: JsModule) {
    switch (module.moduleLib) {
        case JsModuleLibs.cjs:
            return extractCjsModuleImports(module);
        case JsModuleLibs.internal:
            return [];
    }
}
