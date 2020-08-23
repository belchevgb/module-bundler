import { Preprocessor, PreprocessorContext } from "../preprocessor";
import ts = require("typescript");

export class TypeScriptPreprocessor extends Preprocessor {
    preprocess(ctx: PreprocessorContext): Promise<PreprocessorContext> {
        if (ctx.extension !== ".ts") {
            return null;
        }

        ctx.fileContent = ts.transpileModule(ctx.fileContent, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
        ctx.extension = ".js";
        
        return Promise.resolve(ctx);
    }
}