import * as ts from "typescript";
import { Asset } from "../../interfaces";
import { parseModule } from "../js/ast/parse";

export enum JsModuleLibs {
    cjs,
    es2015,
    internal
}

export class JsModule extends Asset {
    constructor(
        public readonly originalFilePath: string,
        public readonly originalExtension: string,
        public latestContent: any,
        public currentExtension: string,
        public id: string,
        public ast: ts.SourceFile
    ) { 
        super(originalFilePath, originalExtension, latestContent, currentExtension, id);
    }

    internalModule = false;
}

export function createJsModule(originalFilePath: string, originalExtension: string, content: any, currentExtension: string, id: string): JsModule {
    const filename = `${id}${currentExtension}`;
    return new JsModule(originalFilePath, originalExtension, content, currentExtension, id, parseModule(filename, content));
}