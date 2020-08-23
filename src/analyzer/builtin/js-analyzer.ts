import { AssetAnalyzer, AssetMetadata } from "..";
import { Asset } from "../../interfaces";
import { getImportedModulePaths } from "../../compiler/js/ast/parse";
import { JsModule } from "../../compiler/modules/js-module";

export class DefaultJsAnalyzer extends AssetAnalyzer {
    analyze(asset: Asset): Promise<AssetMetadata> {
        if (!(asset instanceof JsModule)) {
            return null;
        }

        const imports = getImportedModulePaths(asset as JsModule);
        return Promise.resolve({
            imports
        });
    }
}