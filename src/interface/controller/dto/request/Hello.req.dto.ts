import {IsNotEmpty, IsNumber, IsString} from "class-validator"
import {Transform} from "class-transformer"

export class HelloReqDto {
    @IsString()
    @IsNotEmpty()
    readonly hello: string

    @Transform(({value}) => Number(value))
    @IsNumber()
    @IsNotEmpty()
    readonly count: string

    constructor(hello: string, count: string) {
        this.hello = hello
        this.count = count
    }
}