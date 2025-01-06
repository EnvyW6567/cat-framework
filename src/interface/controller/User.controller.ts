import {UserService} from "../../domain/user/User.service";
import {LoginReqDto} from "./dto/request/LoginReq.dto";
import {SignupReqDto} from "./dto/request/SignupReq.dto";
import {HttpResponseDto} from "../http/HttpResponse.dto";
import {SessionManager} from "../session/SessionManager";
import {PostMapping} from "../../core/decorator/method/RequestMapper.decorator";
import {Controller} from "../../core/decorator/class/Controller.decorator";
import {RequestBody} from "../../core/decorator/param/RequestBody.decorator";
import {Authenticated} from "../../core/decorator/param/Authenticated.decorator";

@Controller("/api/user")
export class UserController {
    constructor(private readonly userService: UserService,
                private readonly sessionManager: SessionManager) {
    }

    @PostMapping("/login")
    async login(@RequestBody() loginReqDto: LoginReqDto) {
        // const result = await this.userService.login(loginReqDto);
        // const sessionId = this.sessionManager.register(result.id);
        //
        // result.setSessionId(sessionId);
        const result = "success";

        return new HttpResponseDto(result);
    }

    @PostMapping("/signup")
    async signup(@RequestBody() signupReqDto: SignupReqDto) {
        const result = await this.userService.signup(signupReqDto);

        return new HttpResponseDto(result);
    }

    @PostMapping("/logout")
    async logout(@Authenticated() userId: number) {
       this.sessionManager.remove(userId);

       return new HttpResponseDto();
    }
}
