export class SignupReqDto {
    readonly email: string;
    readonly password: string;
    readonly username: string;

    constructor(email: string, password: string, username: string) {
        this.email = email;
        this.password = password;
        this.username = username;
    }
}