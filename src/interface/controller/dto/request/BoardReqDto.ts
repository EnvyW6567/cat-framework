import {IsNotEmpty} from "class-validator";

export class BoardReqDto {
    @IsNotEmpty()
    readonly size: number;
    @IsNotEmpty()
    readonly page: number;

    constructor(size: number, page: number) {
        this.size = size;
        this.page = page;
    }
}