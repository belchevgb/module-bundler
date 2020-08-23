import { Asset, System } from "../interfaces";
import { EXPORTED_MEMBERS_PROP_NAME } from "../compiler/js/ast/utils";

export abstract class AssetTransformer {
    abstract transform(asset: Asset, system: System): Promise<string>;
}

const transformers: AssetTransformer[] = [];

export function registerTransformer(transformer: AssetTransformer) {
    transformers.push(transformer);
}

const moduleWrapper = `__addModule('{{moduleId}}', function(${EXPORTED_MEMBERS_PROP_NAME}) {
    {{body}}
    return ${EXPORTED_MEMBERS_PROP_NAME};
});`;

export function wrapModule(module: string, id: string) {
    return moduleWrapper
        .replace("{{moduleId}}", id.toString())
        .replace("{{body}}", module);
}

export async function transformAsset(asset: Asset, system: System): Promise<string> {
    for (const t of transformers) {
        const res = await t.transform(asset, system);
        if (res !== null && res !== undefined) {
            return wrapModule(res, asset.id);
        }
    }

    throw "Asset cannot be transformed.";
}