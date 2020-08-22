export interface Path {
    join(...segments: string[]): string;

    getFileName(path: string): string;

    resolve(...segments: string[]): string;

    getDirname(...segments: string[]): string;

    relativeToTargetDir(targetPath: string, relativePath: string): string;

    getFileExtension(path: string): string;

    isAbsolute(path: string): boolean;
}