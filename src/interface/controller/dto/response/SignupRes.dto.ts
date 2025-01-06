import {UserEntity} from "../../../../domain/user/User.entity";
import {MapperException} from "../exception/MapperException";
import {MapperExceptionType} from "../exception/MapperExceptionType";
import {IsNotEmpty} from "class-validator";

export class SignupResDto {

    @IsNotEmpty()
    readonly email: string;
    @IsNotEmpty()
    readonly username: string;

    constructor(email: string, username: string) {
        this.email = email;
        this.username = username;
    }

    static of(user: UserEntity) {
        if (user.email && user.username) {
            return new SignupResDto(user.email, user.username);
        }
        throw new MapperException(MapperExceptionType.FAILED_MAPPING);
    }
}