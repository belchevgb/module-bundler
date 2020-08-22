import { Preprocessor } from "../preprocessor";
import { Asset } from "../../interfaces";
import ts = require("typescript");

export class TypeScriptPreprocessor extends Preprocessor {
    preprocess(asset: Asset): Promise<{ asset: Asset; continueChain?: boolean; }> {
        if (asset.extension !== ".ts") {
            return null;
        }

        asset.content = ts.transpileModule(asset.content, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
        asset.extension = ".js";
        
        return Promise.resolve({ asset });
    }
}