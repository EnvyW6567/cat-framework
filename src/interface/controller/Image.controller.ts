import { ImageService } from '../../domain/image/Image.service';
import { PostMapping } from '../../core/decorator/method/RequestMapper.decorator';
import { Multipart } from '../../core/decorator/param/Multipart.decorator';
import { MultipartType } from '../http/HttpParser';
import { HttpResponseDto } from '../http/HttpResponse.dto';
import { Controller } from '../../core/decorator/class/Controller.decorator';
import { RequestParam } from '../../core/decorator/param/RequestParam.decorator';
import { UploadImageReqDto } from './dto/request/UploadImageReq.dto';

@Controller('/api/image')
export class ImageController {
    constructor(private readonly imageService: ImageService) {}

    @PostMapping('/upload')
    async uploadFile(
        @Multipart() files: MultipartType[],
        @RequestParam() uploadImageReqDto: UploadImageReqDto,
    ) {
        const results = await this.imageService.uploadImages(files, uploadImageReqDto);

        if (results.every((e) => e === true)) {
            return new HttpResponseDto({ message: 'upload success' });
        }
        return new HttpResponseDto({ message: 'upload failed' });
    }
}
