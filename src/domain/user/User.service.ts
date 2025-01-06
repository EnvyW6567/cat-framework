import bcrypt from 'bcrypt';
import {Inject} from "../../core/decorator/param/Inject.decorator";
import {Service} from "../../core/decorator/class/Injectable.decorator";
import {UserRepository} from "./User.repository";
import {UserEntity} from "./User.entity";
import {UserException} from "./exception/UserException";
import {UserExceptionType} from "./exception/UserExceptionType";
import {LoginReqDto} from "../../interface/controller/dto/request/LoginReq.dto";
import {LoginResDto} from "../../interface/controller/dto/response/LoginRes.dto";
import {SignupReqDto} from "../../interface/controller/dto/request/SignupReq.dto";
import {SignupResDto} from "../../interface/controller/dto/response/SignupRes.dto";

@Service()
export class UserService {

    constructor(@Inject("UserRepository") private readonly userRepository: UserRepository) {
    }

    public async login(data: LoginReqDto): Promise<LoginResDto> {
        const user = await this.userRepository.findUserByEmail(data.email);

        if (!user) throw new UserException(UserExceptionType.LOGIN_FAILED);

        await this.validateLogin(data.password, user);

        return LoginResDto.of(user);
    }

    public async signup(data: SignupReqDto): Promise<SignupResDto> {
        await this.validateSignupData(data);

        const hashedPassword = await this.hashPassword(data.password);
        const newUser = new UserEntity({
            ...data,
            password: hashedPassword
        });

        await this.userRepository.save(newUser);
        const user = await this.userRepository.findUserByEmail(data.email);

        if (user) {
            return SignupResDto.of(user);
        }
        throw new UserException(UserExceptionType.SIGNUP_ERROR);
    }

    private async validateSignupData(data: { email: string; password: string; username: string }): Promise<void> {
        if (!data.email || !data.password || !data.username) {
            throw new UserException(UserExceptionType.INVALID_INPUT);
        }
        if (!this.isValidEmail(data.email)) {
            throw new UserException(UserExceptionType.INVALID_EMAIL);
        }
        const existingUser = await this.userRepository.existsByEmail(data.email);

        if (existingUser) {
            throw new UserException(UserExceptionType.EMAIL_ALREADY_EXISTS);
        }
        if (data.password.length < 8) {
            throw new UserException(UserExceptionType.INVALID_PASSWORD);
        }
        if (data.username.length < 2) {
            throw new UserException(UserExceptionType.INVALID_NAME);
        }
    }

    private isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        return emailRegex.test(email);
    }

    private async hashPassword(password: string): Promise<string> {
        const saltRounds = 12;

        return bcrypt.hash(password, saltRounds);
    }

    private async validateLogin(password: string, user: UserEntity) {
        if (await bcrypt.compare(password, user.password as string)) {
            return;
        }
        throw new UserException(UserExceptionType.LOGIN_FAILED);
    }

}
