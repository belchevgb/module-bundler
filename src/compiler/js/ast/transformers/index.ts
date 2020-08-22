import { JsModule, JsModuleLibs } from "../../module";
import ts = require("typescript");
import { transformCjsModule } from "./module-transformers/cjs-module-transformer";
import { wrapModule } from "./runtime-wrap";

export function transformJsModule(module: JsModule) {
    switch (module.moduleLib) {
        case JsModuleLibs.cjs:
            transformCjsModule(module);
            break;
    }

    module.ast = ts.createSourceFile(`${module.id}.js`, wrapModule(module), module.ast.languageVersion);
}