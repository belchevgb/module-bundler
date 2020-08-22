import * as ts from "typescript";
import { Asset } from "../../interfaces";

export enum JsModuleLibs {
    cjs,
    es2015,
    internal
}

export class JsModule extends Asset {
    ast: ts.SourceFile;
    id: string;
    moduleLib: JsModuleLibs;
    fileName: string;
}