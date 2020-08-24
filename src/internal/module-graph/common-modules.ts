import { Asset } from "../../interfaces";
import { hasValue } from "../../utils/common";

const commonModules = new Map<string, boolean>();

function checkIfModuleIsCommon(module: Asset): boolean {
    const isUsedInMoreThanOneBundles = module.rootAssetIds?.length > 1;
    if (!isUsedInMoreThanOneBundles) {
        return false;
    }

    for (const dependentModule of module.dependencies) {
        if (!checkIfModuleIsCommon(dependentModule)) {
            return false;
        }
    }

    return true;
}

export function isCommonModule(module: Asset) {
    const cachedResult = commonModules.get(module.id);
    if (hasValue(cachedResult)) {
        return cachedResult;
    }

    const isCommonModule = checkIfModuleIsCommon(module);

    commonModules.set(module.id, isCommonModule);
    return isCommonModule;
}