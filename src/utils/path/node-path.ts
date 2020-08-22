import { Path } from "./interfaces";
import { join, basename, resolve, dirname, extname, isAbsolute } from "path";

export class NodeJsPath implements Path {
    getFileName(path: string): string {
        return basename(path);
    }

    join(...segments: string[]): string {
        return join(...segments);
    }

    resolve(...segments: string[]): string {
        return resolve(...segments);
    }

    getDirname(...segments: string[]): string {
        return dirname(this.resolve(...segments));
    }

    relativeToTargetDir(targetPath: string, relativePath: string): string {
        return this.resolve(this.getDirname(targetPath), relativePath);
    }

    getFileExtension(path: string): string {
        return extname(path);
    }

    isAbsolute(path: string): boolean {
        return isAbsolute(path);
    }
}