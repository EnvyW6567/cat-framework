import dotenv from "dotenv";
import './src/dependencies';

import {Injectable} from "./src/core/decorator/class/Injectable.decorator";
import {CatServer} from "./CatServer";
import {DIContainer} from "./src/core/container/DIContainer";
import {SessionHandler} from "./src/interface/middleware/handler/SessionHandler";
import {ErrorHandler} from "./src/interface/middleware/handler/ErrorHandler";
import {Router} from "./src/interface/router/Router";

dotenv.config();

@Injectable()
class Application {

    constructor(private readonly server: CatServer,
                private readonly router: Router,
                private readonly sessionHandler: SessionHandler,
                private readonly exceptionHandler: ErrorHandler) {
    }

    async start() {
        try {
            const port = (process.env.PORT || 3000) as number;

            await this.configureServer();
            await this.server.create();
            await this.server.listen(port);
        } catch (error) {
            throw Error("Start server failed.");
        }
    }

    private async configureServer() {
        this.sessionHandler.pathMatcher("/mypage", "ROLE_USER")
            .pathMatcher("/api/user/mypage", "ROLE_USER", "ROLE_ADMIN")
            .pathMatcher("/api/post/write")
            .pathMatcher("/api/user/logout");

        this.server
            .use(this.sessionHandler)
            .use(this.router)
            .use(this.exceptionHandler);
    }
}

const app = DIContainer.getInstance().resolve<Application>("Application");

app.start()
    .catch(error => {
        console.error("Failed to start the application:", error);
        process.exit(1);
    });