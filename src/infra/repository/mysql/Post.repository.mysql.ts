import {PostRepository} from "../../../domain/post/Post.repository";
import {PostEntity} from "../../../domain/post/Post.entity";
import {Repository} from "../../../core/decorator/class/Injectable.decorator";
import {MysqlDatabase} from "../../database/mysql/MysqlDatabase";
import {UserEntity} from "../../../domain/user/User.entity";

@Repository("PostRepository")
export class PostRepositoryMysql implements PostRepository {
    readonly COUNT = "COUNT(*)";

    constructor(private readonly mysqlDatabase: MysqlDatabase) {
    }

    async findByPage(size: number, page: number): Promise<PostEntity[]> {
        const sql = `SELECT p.id, u.username, p.title, p.created_at
                     FROM post p
                              JOIN user u ON p.author_id = u.id
                     ORDER BY p.created_at DESC
                     LIMIT ? OFFSET ?`
        const param = [parseInt(String(size)), parseInt(String(page * size))];

        const data = await this.mysqlDatabase.query(sql, param);

        return this.mapToEntity(data) as PostEntity[];
    }

    async findById(id: number): Promise<PostEntity> {
        const sql = `SELECT p.id, u.username, p.title, p.content, p.created_at
                     FROM post p
                              JOIN user u ON p.author_id = u.id
                     WHERE p.id = ?`
        const param = [id];

        const data = await this.mysqlDatabase.query(sql, param);

        return this.mapToEntity(data) as PostEntity;
    }

    async save(post: PostEntity): Promise<boolean> {
        const sql = `INSERT INTO post (author_id, title, content)
                     VALUES (?, ?, ?)`
        const param = [post.author?.id, post.title, post.content];

        await this.mysqlDatabase.query(sql, param);

        return true;
    }

    async countAll(): Promise<number> {
        const sql = `SELECT COUNT(*) FROM post`;

        const data = await this.mysqlDatabase.query(sql);

        return data[0][this.COUNT];
    }

    mapToEntity(data: any[]): PostEntity[] | PostEntity {
        if (data.length > 2) {
            return data.map((row) => this.createBoardEntity(row));
        }

        return this.createBoardEntity(data[0]);
    }

    private createBoardEntity(row: any): PostEntity {
        const user = new UserEntity({
            username: row.username
        });

        return new PostEntity({
            id: row.id,
            author: user,
            title: row.title,
            content: row.content,
            createdAt: row.created_at
        });
    }
}