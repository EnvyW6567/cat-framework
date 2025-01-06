import {PostEntity} from "./Post.entity";

export interface PostRepository extends Repository<PostEntity>{
    findById(id: number): Promise<PostEntity>;
    findByPage(size: number, page: number): Promise<PostEntity[]>;
    save(post: PostEntity): Promise<boolean>;
    countAll(): Promise<number>;
}