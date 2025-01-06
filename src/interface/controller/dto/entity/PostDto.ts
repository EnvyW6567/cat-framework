import {PostEntity} from "../../../../domain/post/Post.entity";
import {MapperException} from "../exception/MapperException";
import {MapperExceptionType} from "../exception/MapperExceptionType";

export class PostDto {
    readonly id: number;
    readonly author: string;
    readonly title: string;
    readonly createdAt: Date;

    constructor(id: number, author: string, title: string, createdAt: Date) {
        this.id = id;
        this.author = author;
        this.title = title;
        this.createdAt = createdAt;
    }

    static of(board: PostEntity) {
        if (board.id && board.author?.username && board.title && board.createdAt) {
            return new PostDto(board.id, board.author?.username, board.title, board.createdAt);
        }
        throw new MapperException(MapperExceptionType.FAILED_MAPPING);
    }
}