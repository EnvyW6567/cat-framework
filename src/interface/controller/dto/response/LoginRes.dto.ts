import { UserEntity } from '../../../../domain/user/User.entity';
import { MapperException } from '../exception/MapperException';
import { MapperExceptionType } from '../exception/MapperExceptionType';

export class LoginResDto {
    readonly id: number;
    readonly username: string;
    private sessionId: string | undefined;

    constructor(id: number, username: string) {
        this.id = id;
        this.username = username;
    }

    setSessionId(sessionId: string) {
        this.sessionId = sessionId;
    }

    static of(user: UserEntity) {
        if (user.id && user.username) {
            return new LoginResDto(user.id, user.username);
        }
        throw new MapperException(MapperExceptionType.FAILED_MAPPING);
    }
}
