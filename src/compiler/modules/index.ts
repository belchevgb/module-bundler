import { Asset } from "../../interfaces";
import { JsModule, createJsModule } from "./js-module";

export function createAsset(originalFilePath: string, originalExtension: string, content: any, currentExtension: string, id: string): Asset {
    if (currentExtension === ".js") {
        return createJsModule(originalFilePath, originalExtension, content, currentExtension, id);
    }
}