import {IsNotEmpty} from "class-validator";

export class PostReqDto {
    @IsNotEmpty()
    readonly id: number;

    constructor(id: number) {
        this.id = id;
    }
}