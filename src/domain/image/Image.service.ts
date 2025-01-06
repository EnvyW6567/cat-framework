import {Injectable} from "../../core/decorator/class/Injectable.decorator";
import {MultipartType} from "../../interface/http/HttpParser";
import {Inject} from "../../core/decorator/param/Inject.decorator";
import {ImageRepository} from "./Image.repository";
import {FileService} from "../file/File.service";
import {ImageEntity} from "./Image.entity";
import {PostEntity} from "../post/Post.entity";
import {UploadImageReqDto} from "../../interface/controller/dto/request/UploadImageReq.dto";

@Injectable()
export class ImageService {
    constructor(private readonly fileService: FileService,
                @Inject("ImageRepository") private readonly imageRepository: ImageRepository) {
    }

    async uploadImages(images: MultipartType[], req: UploadImageReqDto) {
        const paths = await this.fileService.uploadFiles(images);
        const imageEntities = paths.map((path) => new ImageEntity({
            post: new PostEntity({id: req.postId}),
            path
        }));


        return await Promise.all(imageEntities.map((image) => this.imageRepository.save(image)));
    }
}