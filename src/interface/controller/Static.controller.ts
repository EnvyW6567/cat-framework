import { GetMapping } from '../../core/decorator/method/RequestMapper.decorator'
import fs from 'fs/promises'
import { Controller } from '../../core/decorator/class/Controller.decorator'
import { HttpResponseDto } from '../http/HttpResponse.dto'

@Controller()
export class StaticController {
    @GetMapping('/')
    async getIndex() {
        const buffer = await fs.readFile(process.env.VIEW_FILE_PATH + '/index.html')

        return new HttpResponseDto(buffer, 200, { 'Content-Type': 'text/html' })
    }

    @GetMapping('/login')
    async getLogin() {
        const buffer = await fs.readFile(process.env.VIEW_FILE_PATH + '/login.html')

        return new HttpResponseDto(buffer, 200, { 'Content-Type': 'text/html' })
    }

    @GetMapping('/signup')
    async getSignup() {
        const buffer = await fs.readFile(process.env.VIEW_FILE_PATH + '/signup.html')

        return new HttpResponseDto(buffer, 200, { 'Content-Type': 'text/html' })
    }

    @GetMapping('/write')
    async getWrite() {
        const buffer = await fs.readFile(process.env.VIEW_FILE_PATH + '/write.html')

        return new HttpResponseDto(buffer, 200, { 'Content-Type': 'text/html' })
    }

    @GetMapping('/post')
    async getPost() {
        const buffer = await fs.readFile(process.env.VIEW_FILE_PATH + '/post.html')

        return new HttpResponseDto(buffer, 200, { 'Content-Type': 'text/html' })
    }
}
