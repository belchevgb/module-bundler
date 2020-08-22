import { readFileSync, existsSync } from "fs";
import { FileSystem } from "./interfaces";

export class NodeJsFileSystem implements FileSystem {
    readTextFile(path: string): string {
        return readFileSync(path, "utf8");
    }

    exists(path: string): boolean {
        return existsSync(path);
    }
}