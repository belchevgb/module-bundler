import ts = require("typescript");
import { Asset } from "../../../interfaces";
import { JsModule } from "../module";

export const INTERNAL_REQUIRE_FN_NAME = "__internalRequire";
export const EXPORTED_MEMBERS_PROP_NAME = "__exportedMembers";

export function visitEachJsModule(mdoule: JsModule, cb: (m: JsModule) => void) {
    cb(mdoule);

    if (mdoule?.dependencies?.length) {
        (mdoule.dependencies as JsModule[]).forEach(ch => visitEachJsModule(ch, cb));
    }
}

export function visitEachNode(node: ts.Node, cb: (n: ts.Node) => void) {
    cb(node);

    ts.forEachChild(node, (ch) => visitEachNode(ch, cb));
}

const printer = ts.createPrinter();
export function astToString(ast: ts.Node) {
    return printer.printNode(ts.EmitHint.Unspecified, ast, ast.getSourceFile());
}