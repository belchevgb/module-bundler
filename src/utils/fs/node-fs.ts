import { readFileSync, existsSync, writeFileSync, rmdirSync, unlinkSync } from "fs";
import { FileSystem } from "./interfaces";
import { extname } from "path";

export class NodeJsFileSystem implements FileSystem {
    readTextFile(path: string): string {
        return readFileSync(path, "utf8");
    }

    exists(path: string): boolean {
        return existsSync(path);
    }

    write(path: string, data: string) {
        writeFileSync(path, data, { encoding: "utf-8" });
    }

    delete(path: string): void {
        if (extname(path)) {
            unlinkSync(path);
        } else {
            rmdirSync(path);
        }
    }
}