import {Injectable} from "../../../core/decorator/class/Injectable.decorator";
import fs from "fs/promises";
import {FileRepository} from "../../../domain/file/File.repository";

@Injectable("FileRepository")
export class FileRepositoryFs implements FileRepository {

    async write(filename: string, file: Buffer): Promise<void> {
        return fs.writeFile(filename, file);
    }
}