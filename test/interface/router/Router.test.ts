import fs from 'fs/promises'
import path from "path"
import dotenv from "dotenv"

import {Router} from "../../../cat/router/Router"
import {HttpRequest} from "../../../cat/http/HttpRequest"
import {HttpResponse} from "../../../cat/http/HttpResponse"
import {HttpContentTypeExt} from "../../../cat/http/type/HttpContentType"
import {HttpMethod} from "../../../cat/http/type/HttpMethod"
import {HttpError} from "../../../cat/http/error/HttpError"

dotenv.config()
jest.mock('fs/promises')

describe('Router 테스트', () => {
    let router: Router
    let mockResponse: jest.Mocked<HttpResponse>

    beforeEach(() => {
        router = new Router()
        mockResponse = {
            setBody: jest.fn().mockReturnValue(mockResponse),
            setStatus: jest.fn().mockReturnValue(mockResponse),
            setContentType: jest.fn().mockReturnValue(mockResponse),
            send: jest.fn(),
        } as unknown as jest.Mocked<HttpResponse>
    })

    const createMockRequest = (method: HttpMethod, url: string, ext: HttpContentTypeExt = ''): HttpRequest => {
        return {
            method,
            url,
            path: url,
            params: {},
            header: {},
            body: undefined,
            ext,
            logReq: jest.fn()
        } as unknown as HttpRequest
    }

    const testRoute = async (method: HttpMethod, url: string, ext: HttpContentTypeExt = '') => {
        const mockRequest = createMockRequest(method, url, ext)
        await router.handle(mockRequest, mockResponse, ()=>{})
        return mockRequest
    }

    const testStaticFile = async (url: string, ext: HttpContentTypeExt, expectedPath: string) => {
        const mockFileContent = 'mock file content' as string

        (fs.readFile as jest.Mock).mockResolvedValue(mockFileContent)

        const mockRequest = createMockRequest('GET', url, ext)
        await router.handle(mockRequest, mockResponse, () => {})

        expect(fs.readFile).toHaveBeenCalledWith(expectedPath)
        expect(mockResponse.setBody).toHaveBeenCalledWith(mockFileContent)
    }

    describe('라우팅에 실패해야함 - ', () => {
        it('없는 path 요청 시', () => {
            const mockRequest = createMockRequest('GET', '/test/not-found')

            expect(async () => await router.handle(mockRequest, mockResponse, () => {})).rejects.toThrow(HttpError)
        })
    })

    describe('HTTP 메서드별 핸들러 동작 테스트', () => {
        it('GET 요청 핸들링에 성공해야함', async () => {
            const mockHandler = jest.fn(() => Promise.resolve())

            router.addRoute('GET', '/test', mockHandler)
            const mockRequest = await testRoute('GET', '/test')
            expect(mockHandler).toHaveBeenCalledWith(mockRequest, mockResponse)
        })

        it('POST 요청 핸들링에 성공해야함', async () => {
            const mockHandler = jest.fn(() => Promise.resolve())

            router.addRoute('POST', '/test', mockHandler)
            const mockRequest = await testRoute('POST', '/test')
            expect(mockHandler).toHaveBeenCalledWith(mockRequest, mockResponse)
        })
    })

    describe('정적 파일 요청 핸들링 테스트', () => {
        it('.css 파일 요청 핸들링에 성공해야함', async () => {
            const staticPath = '/css/test.css'

            await testStaticFile(staticPath, '.css', path.join(process.env.STATIC_FILE_PATH as string, staticPath))
        })

        it('.js 파일 요청 핸들링에 성공해야함', async () => {
            const staticPath = '/js/test.js'

            await testStaticFile(staticPath, '.js', path.join(process.env.STATIC_FILE_PATH as string, staticPath))
        })

        it('.html 파일 요청 핸들링에 성공해야함', async () => {
            const staticPath = '/test.html'

            await testStaticFile(staticPath, '.html', path.join(process.env.STATIC_FILE_PATH as string, '/view', staticPath))
        })
    })
})