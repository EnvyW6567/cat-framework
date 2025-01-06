import {Service} from "../../core/decorator/class/Injectable.decorator";
import {Inject} from "../../core/decorator/param/Inject.decorator";
import {PostRepository} from "./Post.repository";
import {PostDto} from "../../interface/controller/dto/entity/PostDto";
import {BoardResDto} from "../../interface/controller/dto/response/BoardResDto";
import {BoardReqDto} from "../../interface/controller/dto/request/BoardReqDto";
import {PostResDto} from "../../interface/controller/dto/response/PostResDto";
import {PostReqDto} from "../../interface/controller/dto/request/PostReq.dto";
import {WritePostReqDto} from "../../interface/controller/dto/request/WritePostReq.dto";
import {PostEntity} from "./Post.entity";
import {UserEntity} from "../user/User.entity";
import {PostException} from "./exception/PostException";
import {PostExceptionType} from "./exception/PostExceptionType";

@Service()
export class PostService {

    constructor(@Inject("PostRepository") private readonly postRepository: PostRepository) {
    }

    async getBoard(req: BoardReqDto) {
        const total = await this.postRepository.countAll();

        if (total < req.size * req.page) throw new PostException(PostExceptionType.EXCEED_VALID_PAGE);

        const board = await this.postRepository.findByPage(req.size, req.page);

        if (board.length === 0) throw new PostException(PostExceptionType.POST_NOT_FOUND);

        const boardDto: PostDto[] = board.map((board) => PostDto.of(board));

        return BoardResDto.of(boardDto, total);
    }

    async getPost(req: PostReqDto) {
        const post = await this.postRepository.findById(req.id);

        if (!post) throw new PostException(PostExceptionType.POST_NOT_FOUND);

        return PostResDto.of(post);
    }

    async writePost(req: WritePostReqDto, authorId: number) {
        const author = new UserEntity({id: authorId});
        const newPost = new PostEntity({
            author,
            title: req.title,
            content: req.content
        });

        return await this.postRepository.save(newPost);
    }

}