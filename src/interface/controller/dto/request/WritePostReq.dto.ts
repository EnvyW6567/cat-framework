import {IsNotEmpty} from "class-validator";

export class WritePostReqDto {
    @IsNotEmpty()
    readonly title: string;
    @IsNotEmpty()
    readonly content: string;

    constructor(title: string, content: string) {
        this.title = title;
        this.content = content;
    }
}