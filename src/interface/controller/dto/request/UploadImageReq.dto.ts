import { IsNotEmpty } from 'class-validator';

export class UploadImageReqDto {
    @IsNotEmpty()
    readonly postId: number;

    constructor(postId: number) {
        this.postId = postId;
    }
}
