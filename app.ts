import dotenv from "dotenv"

import {SessionHandler} from "./src/interface/middleware/SessionHandler"
import {ErrorHandler} from "./src/interface/middleware/ErrorHandler"
import {Router, Cat, Injectable} from "./cat"
import {CatServer} from "./cat/server/Cat.server"

dotenv.config()

@Injectable()
class Application {
    constructor(
        private readonly router: Router,
        private readonly server: CatServer,
        private readonly sessionHandler: SessionHandler,
        private readonly exceptionHandler: ErrorHandler
    ) {}

    async start() {
        const port = (process.env.PORT || 3000) as number

        await this.configureServer()
        await this.server.create()
        await this.server.listen(port)
    }

    private async configureServer() {
        this.sessionHandler
            .pathMatcher("/mypage", "ROLE_USER")
            .pathMatcher("/api/user/mypage", "ROLE_USER", "ROLE_ADMIN")

        this.server
            .use(this.sessionHandler)
            .use(this.router)
            .use(this.exceptionHandler)
    }
}

Cat.getInstance().bootstrap(Application)
    .then(app => {
        app.start()
    })