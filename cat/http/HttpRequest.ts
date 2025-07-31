import { HttpRequestData, MultipartType } from './HttpParser'
import { logger } from '../core/logger/Logger'
import path from 'path'
import { HttpContentTypeExt, isHttpContentTypeExt } from './type/HttpContentType'
import { HttpMethod } from './type/HttpMethod'
import { HttpErrorType } from './error/HttpErrorType'
import { HttpError } from './error/HttpError'

export class HttpRequest {
    readonly method: HttpMethod
    readonly url: string
    readonly path: string
    readonly params: object
    readonly header: object
    readonly body: object | undefined
    readonly multiparts: MultipartType[] | undefined
    readonly ext: HttpContentTypeExt
    private authenticated: number | undefined

    constructor(httpRequestData: HttpRequestData) {
        this.method = httpRequestData.method
        this.url = httpRequestData.url
        this.path = httpRequestData.path
        this.params = httpRequestData.params
        this.ext = this.validateExt(path.extname(this.url))
        this.header = httpRequestData.headers
        this.body = httpRequestData.body
        this.multiparts = httpRequestData.multiparts
    }

    private logReq() {
        logger.info('Http Request', this)
    }

    private validateExt(ext: string): HttpContentTypeExt {
        if (isHttpContentTypeExt(ext)) {
            return ext
        }
        throw new HttpError(HttpErrorType.NOT_SUPPORT_EXTENSION)
    }

    public setAuthenticated(userId: number) {
        this.authenticated = userId
    }

    public getAuthenticated() {
        if (!this.authenticated) {
            throw new HttpError(HttpErrorType.AUTHENTICATED_FAILED)
        }

        return this.authenticated
    }
}
