import ts = require("typescript");
import { Asset, Bundle, System } from "../../../interfaces";
import { JsModule } from "../../modules/js-module";

export const INTERNAL_REQUIRE_FN_NAME = "__internalRequire";
export const EXPORTED_MEMBERS_PROP_NAME = "__exportedMembers";
export const INTERNAL_ADD_MODULE_FN_NAME = "__addModule";


export function visitEachJsModule(mdoule: JsModule, cb: (m: JsModule) => void) {
    cb(mdoule);

    if (mdoule?.dependencies?.length) {
        (mdoule.dependencies as JsModule[]).forEach(ch => visitEachJsModule(ch, cb));
    }
}

export async function visitEachJsModuleAsync(mdoule: JsModule, cb: (m: JsModule) => Promise<void>) {
    await cb(mdoule);

    if (mdoule?.dependencies?.length) {
        for (const ch of mdoule.dependencies) {
            await visitEachJsModuleAsync(ch as JsModule, cb);
        }
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

export function createRuntimeBundle(system: System): Bundle {
    const runtimePath = system.path.resolveRelativeToProjectRoot("./src/compiler/js/ast/runtime.ts");
    const runtimeSource = system.fs.readTextFile(runtimePath);
    const source = ts.transpileModule(runtimeSource, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
    const bundle = new Bundle();

    bundle.modules.push(source);

    return bundle;
}

export function wrapModule(asset: Asset) {
    return `${INTERNAL_ADD_MODULE_FN_NAME}('${asset.id}', function(${EXPORTED_MEMBERS_PROP_NAME}) {
        ${asset.latestContent}
        return ${EXPORTED_MEMBERS_PROP_NAME};
    });`
}

export function beautifyCode(code: string) {
    const sf = ts.createSourceFile("__dummy.js", code, ts.ScriptTarget.Latest);
    return printer.printFile(sf);
}