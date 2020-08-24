import { Asset, System } from "../interfaces";

export abstract class Optimizer {
    abstract optimize(bundle: string, system: System): Promise<string>;
}

const optimizers: Optimizer[] = [];

export function registerOptimizer(optimizer: Optimizer) {
    optimizers.push(optimizer);
}

export async function optimizeBundle(bundle: string, system: System): Promise<string> {
    for (const opt of optimizers) {
        bundle = await opt.optimize(bundle, system);
    }

    return bundle;
}