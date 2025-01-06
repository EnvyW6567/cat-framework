import {Controller} from "../../core/decorator/class/Controller.decorator";
import {PostService} from "../../domain/post/Post.service";
import {GetMapping, PostMapping} from "../../core/decorator/method/RequestMapper.decorator";
import {RequestParam} from "../../core/decorator/param/ReqeustParam.decorator";
import {BoardReqDto} from "./dto/request/BoardReqDto";
import {HttpResponseDto} from "../http/HttpResponse.dto";
import {PostReqDto} from "./dto/request/PostReq.dto";
import {RequestBody} from "../../core/decorator/param/RequestBody.decorator";
import {WritePostReqDto} from "./dto/request/WritePostReq.dto";
import {Authenticated} from "../../core/decorator/param/Authenticated.decorator";

@Controller("/api/post")
export class PostController {

    constructor(private readonly postService: PostService) {
    }

    @GetMapping("/board")
    async getBoard(@RequestParam() boardReqDto: BoardReqDto) {
        const result = await this.postService.getBoard(boardReqDto);

        return new HttpResponseDto(result);
    }

    @GetMapping("")
    async getPost(@RequestParam() postReqDto: PostReqDto) {
        const result = await this.postService.getPost(postReqDto);

        return new HttpResponseDto(result);
    }

    @PostMapping("/write")
    async writePost(@RequestBody() writePostReqDto: WritePostReqDto, @Authenticated() userId: number) {
        const result = await this.postService.writePost(writePostReqDto, userId);

        if (result) {
            return new HttpResponseDto({message: "write post successful"});
        }
        return new HttpResponseDto({message: "write post failed"});
    }

}