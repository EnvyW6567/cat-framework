import {UserEntity} from "./User.entity";

export interface UserRepository extends Repository<UserEntity> {
    findUserByEmail(email: string): Promise<UserEntity | undefined>;

    existsByEmail(email:string): Promise<boolean>;

    save(user: UserEntity): Promise<boolean>;
}
