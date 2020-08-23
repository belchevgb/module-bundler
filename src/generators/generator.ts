import { Asset } from "../interfaces";

export enum GeneratorCommand {
    moduleId
}

export abstract class Generator {
    abstract generate(command: GeneratorCommand): Promise<any>;
}

const generators: Generator[] = [];

export function registerGenerator(gen: Generator) {
    generators.push(gen);
}

export async function generate(command: GeneratorCommand) {
    for (const gen of generators) {
        const result = await gen.generate(command);
        if (result !== null || result !== undefined) {
            return result;
        }
    }
}