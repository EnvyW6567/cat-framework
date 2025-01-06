import {PostEntity} from "../post/Post.entity";

type ImageType = {
    id?: number,
    post?: PostEntity,
    path?: string,
    createdAt?: Date
}

export class ImageEntity {
    readonly id?: number;
    readonly post?: PostEntity;
    readonly path?: string;
    readonly createdAt?: Date;

    constructor(data: ImageType) {
        this.id = data.id;
        this.post = data.post;
        this.path = data.path;
        this.createdAt = data.createdAt;
    }
}
