export interface FileSystem {
    readTextFile(path: string): string;

    exists(path: string): boolean;
}