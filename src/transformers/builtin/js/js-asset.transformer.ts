import { AssetTransformer } from "../../transformer";
import { Asset, System } from "../../../interfaces";
import { JsModule, JsModuleLibs } from "../../../compiler/modules/js-module";
import { transformCjsModule } from "./cjs-module-transformer";
import { getModuleLib } from "../../../compiler/js/ast/parse";
import { astToString } from "../../../compiler/js/ast/utils";

export class DefaultJsAssetTransformer extends AssetTransformer {
    transform(asset: Asset, system: System): Promise<string> {
        if (asset.currentExtension !== ".js") {
            return null;
        }

        const jsModule = asset as JsModule;
        const moduleLib = getModuleLib(asset.latestContent);

        switch (moduleLib) {
            case JsModuleLibs.cjs:
                transformCjsModule(jsModule);
                break;
            case JsModuleLibs.internal:
                return asset.latestContent;
        }

        return Promise.resolve(astToString(jsModule.ast));
    }
}