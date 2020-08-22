import { Asset, System } from "../interfaces";

export abstract class Optimizer {
    abstract optimize(asset: Asset, system: System): Promise<void>;
}

const optimizers: Optimizer[] = [];

export function registerPathResolver(optimizer: Optimizer) {
    optimizers.push(optimizer);
}

export async function optimizeAsset(asset: Asset, system: System) {
    for (const opt of optimizers) {
        await opt.optimize(asset, system);
    }
}