import {Injectable} from "../../core/decorator/class/Injectable.decorator";
import {MultipartType} from "../../interface/http/HttpParser";
import {Inject} from "../../core/decorator/param/Inject.decorator";
import {FileRepository} from "./File.repository";
import {CONTENT_TYPE_PATH} from "../../interface/http/type/HttpContentType.type";

@Injectable()
export class FileService {

    constructor(@Inject("FileRepository") private readonly fileRepository: FileRepository) {
    }

    async uploadFiles(files: MultipartType[]) {
        return await Promise.all(files.map((file) => {
            const filePath = this.generateFilePath(file);

            this.fileRepository.write(process.env.STATIC_FILE_PATH + filePath, file.body);

            return filePath;
        }));
    }

    generateFilePath(file: MultipartType) {
        return CONTENT_TYPE_PATH[file.contentType] + "/" +
            Date.now() + "_" +
            file.filename;
    }
}