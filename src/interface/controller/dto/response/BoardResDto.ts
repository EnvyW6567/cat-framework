import { PostDto } from '../entity/PostDto';
import { MapperException } from '../exception/MapperException';
import { MapperExceptionType } from '../exception/MapperExceptionType';

export class BoardResDto {
    readonly board: PostDto[];
    readonly total: number;

    constructor(board: PostDto[], total: number) {
        this.board = board;
        this.total = total;
    }

    static of(board: PostDto[], total: number) {
        if (board && total) {
            return new BoardResDto(board, total);
        }
        throw new MapperException(MapperExceptionType.FAILED_MAPPING);
    }
}
