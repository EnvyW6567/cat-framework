export type Header = {
    [key: string]: string
}

export class HttpResponseEntity {
    readonly header: Header
    readonly body: object
    readonly status: number

    constructor(body: any = {}, status: number = 200, header: Header = {}) {
        this.header = header
        this.body = body
        this.status = status
    }
}
