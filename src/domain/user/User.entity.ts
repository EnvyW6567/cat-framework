type UserType = {
    id?: number,
    email?: string,
    username?: string,
    password?: string,
    createdAt?: Date
}

export class UserEntity {
    readonly id: number | undefined;
    readonly email: string | undefined;
    readonly username: string | undefined;
    readonly password: string | undefined;
    readonly createdAt: Date | undefined;

    constructor(data: UserType) {
        this.id = data.id;
        this.email = data.email;
        this.username = data.username;
        this.password = data.password;
        this.createdAt = data.createdAt;
    }
}
