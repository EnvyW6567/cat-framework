import {ImageRepository} from "../../../domain/image/Image.repository";
import {Injectable} from "../../../core/decorator/class/Injectable.decorator";
import {ImageEntity} from "../../../domain/image/Image.entity";
import {MysqlDatabase} from "../../database/mysql/MysqlDatabase";

@Injectable("ImageRepository")
export class ImageRepositoryMysql implements ImageRepository {
    constructor(private readonly mysqlDatabase: MysqlDatabase) {
    }

    async save(image: ImageEntity): Promise<boolean> {
        const query = `INSERT INTO image (post_id, path) VALUES (?, ?)`;
        const params = [image.post?.id, image.path];

        await this.mysqlDatabase.query(query, params);

        return true;
    }

    mapToEntity(data: Array<any>): ImageEntity[] | ImageEntity {
        return data;
    }
}