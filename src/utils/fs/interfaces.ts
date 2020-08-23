export interface FileSystem {
    readTextFile(path: string): string;

    exists(path: string): boolean;

    write(path: string, data: string): void;

    delete(path: string): void;
}