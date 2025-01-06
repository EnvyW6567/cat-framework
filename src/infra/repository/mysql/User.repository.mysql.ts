import {UserEntity} from "../../../domain/user/User.entity";
import {UserRepository} from "../../../domain/user/User.repository";
import {Injectable} from "../../../core/decorator/class/Injectable.decorator";
import {MysqlDatabase} from "../../database/mysql/MysqlDatabase";

@Injectable('UserRepository')
export class UserRepositoryMysql implements UserRepository {

    constructor(private readonly mysqlDatabase: MysqlDatabase) {
    }

    async findUserByEmail(email: string): Promise<UserEntity | undefined> {
        const sql = `SELECT u.id, u.email, u.username, u.password, u.created_at
                     FROM user u
                     WHERE u.email = ?`
        const param = [email];

        const data = await this.mysqlDatabase.query(sql, param);

        if (data.length === 0) {
            return undefined;
        }
        return this.mapToEntity(data) as UserEntity;
    }

    async existsByEmail(email: string): Promise<boolean> {
        const sql = `SELECT EXISTS(SELECT 1 FROM user WHERE email = ?) AS flag`;
        const param = [email];

        const [{flag}] = await this.mysqlDatabase.query(sql, param);

        return flag === 1;
    }

    async save(user: UserEntity): Promise<boolean> {
        const sql = `INSERT INTO user (email, username, password)
                     VALUES (?, ?, ?)`
        const param = [user.email, user.username, user.password];

        await this.mysqlDatabase.query(sql, param);

        return true;
    }

    mapToEntity(data: any[]): UserEntity | UserEntity[] {
        if (data.length > 2) {
            return data.map((row) => new UserEntity(row));
        }

        return new UserEntity(data[0]);
    }

}
