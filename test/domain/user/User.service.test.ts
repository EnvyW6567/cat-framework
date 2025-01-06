import {UserService} from "../../../src/domain/user/User.service";
import bcrypt from 'bcrypt';
import {UserRepository} from "../../../src/domain/user/User.repository";
import {UserEntity} from "../../../src/domain/user/User.entity";
import {UserException} from "../../../src/domain/user/exception/UserException";
import {UserExceptionType} from "../../../src/domain/user/exception/UserExceptionType";
import {SignupResDto} from "../../../src/interface/controller/dto/response/SignupRes.dto";

jest.mock('bcrypt');

describe('UserService 테스트', () => {
    let userService: UserService;
    let mockUserRepository: jest.Mocked<UserRepository>;

    beforeEach(() => {
        mockUserRepository = {
            findUserByEmail: jest.fn(),
            existsByEmail: jest.fn(),
            save: jest.fn(),
            mapToEntity: jest.fn()
        };

        userService = new UserService(mockUserRepository);
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe('login', () => {
        it('로그인에 성공해야함', async () => {
            const mockUser = new UserEntity({
                id: 1,
                email: 'test@example.com',
                password: 'hashedPassword',
                username: 'testuser'
            });
            const expectRes = SignupResDto.of(mockUser);
            mockUserRepository.findUserByEmail.mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);

            const result = await userService.login({ email: 'test@example.com', password: 'correctPassword' });

            expect(result).toEqual(expectRes);
            expect(mockUserRepository.findUserByEmail).toHaveBeenCalledWith('test@example.com');
            expect(bcrypt.compare).toHaveBeenCalledWith('correctPassword', 'hashedPassword');
        });

        it('로그인에 실패해야함 - 잘못된 비밀번호', async () => {
            const mockUser = new UserEntity({
                email: 'test@example.com',
                password: 'hashedPassword',
                username: 'testuser'
            });
            mockUserRepository.findUserByEmail.mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            await expect(userService.login({ email: 'test@example.com', password: 'wrongPassword' }))
                .rejects.toThrow(new UserException(UserExceptionType.LOGIN_FAILED));
        });

        it('로그인에 실패해야함 - 없는 이메일', async () => {
            mockUserRepository.findUserByEmail.mockResolvedValue(undefined);

            await expect(userService.login({ email: 'nonexistent@example.com', password: 'anyPassword' }))
                .rejects.toThrow(new UserException(UserExceptionType.LOGIN_FAILED));
        });
    });

    describe('signup', () => {
        it('회원가입에 성공해야함', async () => {
            mockUserRepository.existsByEmail.mockResolvedValue(false);
            (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
            mockUserRepository.save.mockImplementation(() => Promise.resolve(true));

            const newUser = await userService.signup({
                email: 'newuser@example.com',
                password: 'validPassword',
                username: 'newuser'
            });

            expect(newUser).toBeInstanceOf(SignupResDto);
            expect(newUser.email).toBe('newuser@example.com');
            expect(newUser.username).toBe('newuser');
            expect(mockUserRepository.existsByEmail).toHaveBeenCalledWith('newuser@example.com');
            expect(bcrypt.hash).toHaveBeenCalledWith('validPassword', 12);
            expect(mockUserRepository.save).toHaveBeenCalled();
        });

        it('회원가입에 실패해야함 - 이메일 중복', async () => {
            mockUserRepository.existsByEmail.mockResolvedValue(true);

            await expect(userService.signup({
                email: 'existing@example.com',
                password: 'validPassword',
                username: ''
            })).rejects.toThrow(new UserException(UserExceptionType.INVALID_INPUT));
        });

        it('회원가입에 실패해야함 - 이메일 중복', async () => {
            mockUserRepository.existsByEmail.mockResolvedValue(true);

            await expect(userService.signup({
                email: 'existing@example.com',
                password: 'validPassword',
                username: 'existinguser'
            })).rejects.toThrow(new UserException(UserExceptionType.EMAIL_ALREADY_EXISTS));
        });

        it('회원가입에 실패해야함 - 이메일 포맷 불일치', async () => {
            await expect(userService.signup({
                email: 'invalidemail',
                password: 'validPassword',
                username: 'testuser'
            })).rejects.toThrow(new UserException(UserExceptionType.INVALID_EMAIL));
        });

        it('회원가입에 실패해야함 - 4자리 이하 비밀번호', async () => {
            await expect(userService.signup({
                email: 'valid@example.com',
                password: 'short',
                username: 'testuser'
            })).rejects.toThrow(new UserException(UserExceptionType.INVALID_PASSWORD));
        });

        it('회원가입에 실패해야함 - 2자리 이하 유저이름', async () => {
            await expect(userService.signup({
                email: 'valid@example.com',
                password: 'validPassword',
                username: 'a'
            })).rejects.toThrow(new UserException(UserExceptionType.INVALID_NAME));
        });
    });
});