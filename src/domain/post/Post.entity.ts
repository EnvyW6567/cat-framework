import {UserEntity} from "../user/User.entity";

type BoardType = {
    id?: number,
    author?: UserEntity,
    title?: string,
    content?: string,
    createdAt?: Date
}

export class PostEntity {
    readonly id?: number;
    readonly author?: UserEntity;
    readonly title?: string;
    readonly content?: string;
    readonly createdAt?: Date;

    constructor(data: BoardType) {
        this.id = data.id;
        this.author = data.author;
        this.title = data.title;
        this.content = data.content;
        this.createdAt = data.createdAt;
    }
}
