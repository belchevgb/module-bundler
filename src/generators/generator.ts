import { Asset } from "../interfaces";

export enum GeneratorCommand {
    jsModuleId
}

export abstract class Generator {
    abstract generate(command: GeneratorCommand, asset: Asset): Promise<any>;
}

const generators: Generator[] = [];

export function registerGenerator(gen: Generator) {
    generators.push(gen);
}

export async function generate(command: GeneratorCommand, asset: Asset) {
    for (const gen of generators) {
        const result = await gen.generate(command, asset);
        if (result !== null || result !== undefined) {
            return result;
        }
    }
}