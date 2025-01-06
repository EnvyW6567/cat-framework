export type HeaderType = {
    [key: string]: string;
}

export class HttpResponseDto {
    readonly header: HeaderType;
    readonly body: object;
    readonly status: number;


    constructor(body: any = {}, status: number = 200, header: HeaderType = {}) {
        this.header = header;
        this.body = body;
        this.status = status;
    }
}