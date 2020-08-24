import { Asset, System } from "../../../interfaces";
import { JsModule, JsModuleLibs } from "../../../compiler/modules/js-module";
import { transformCjsModule } from "./cjs-module-transformer";
import { getModuleLib } from "../../../compiler/js/ast/parse";
import { astToString } from "../../../compiler/js/ast/utils";
import { Preprocessor, PreprocessorContext } from "../../preprocessor";
import ts = require("typescript");

export class InternalJsModulePreprocessor extends Preprocessor {
    preprocess(ctx: PreprocessorContext): Promise<PreprocessorContext> {
        if (ctx.extension !== ".js") {
            return null;
        }

        const moduleLib = getModuleLib(ctx.fileContent);
        let ast: ts.Node = ts.createSourceFile("module.js", ctx.fileContent, ts.ScriptTarget.ES5);

        switch (moduleLib) {
            case JsModuleLibs.cjs:
                ast = transformCjsModule(ast);
                break;
        }

        return Promise.resolve({ fileContent: astToString(ast), extension: ctx.extension });
    }
}