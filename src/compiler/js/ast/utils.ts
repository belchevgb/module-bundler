import ts = require("typescript");
import { Asset } from "../../../interfaces";
import { JsModule } from "../module";

export function visitEachJsModule(mdoule: JsModule, cb: (m: JsModule) => void) {
    cb(mdoule);

    if (mdoule?.dependencies?.length) {
        (mdoule.dependencies as JsModule[]).forEach(m => visitEachJsModule(m, cb));
    }
}

const printer = ts.createPrinter();
export function astToString(ast: ts.Node) {
    return printer.printNode(ts.EmitHint.Unspecified, ast, ast.getSourceFile());
}