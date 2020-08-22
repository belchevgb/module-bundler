import { FileSystem } from "./interfaces";
import { NodeJsFileSystem } from "../fs/node-fs";

let fs: FileSystem;

export function getFileSystem(): FileSystem {
    if (!fs) fs = new NodeJsFileSystem();
    return fs;
}