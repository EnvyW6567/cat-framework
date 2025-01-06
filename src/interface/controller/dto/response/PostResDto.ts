import {PostEntity} from "../../../../domain/post/Post.entity";
import {MapperException} from "../exception/MapperException";
import {MapperExceptionType} from "../exception/MapperExceptionType";

export class PostResDto {
    readonly id: number;
    readonly author: string;
    readonly title: string;
    readonly content: string;
    readonly createdAt: Date;


    constructor(id: number, author: string, title: string, content: string, createdAt: Date) {
        this.id = id;
        this.author = author;
        this.title = title;
        this.content = content;
        this.createdAt = createdAt;
    }

    static of(post: PostEntity) {
        if (post.id && post.author?.username && post.title && post.content && post.createdAt) {
            return new PostResDto(post.id, post.author.username, post.title, post.content, post.createdAt);
        }
        throw new MapperException(MapperExceptionType.FAILED_MAPPING);
    }
}