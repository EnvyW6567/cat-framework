import {Controller, GetMapping} from "../../../cat"
import {RequestParam} from "../../../cat/core/decorator/param/RequestParam.decorator"
import {HttpResponseEntity} from "../../../cat/http/entity/HttpResponse.entity"
import {HelloReqDto} from "./dto/request/Hello.req.dto"

@Controller("/api/v1")
export class ApiController {
    constructor() {}

    @GetMapping("/hello")
    public getHello(@RequestParam() param: HelloReqDto) {
        let str = ""

        for (let i = 0; i < Number(param.count); i++) {
            str += param.hello
        }

        return new HttpResponseEntity(str, 200, { 'Content-Type': 'text/html' })
    }
}