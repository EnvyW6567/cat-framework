import { HttpResponse } from '../../../cat'
import { HttpRequest } from '../../../cat'
import { Injectable } from '../../../cat'
import { SessionManager } from '../session/SessionManager'
import { SessionError } from '../session/error/SessionError'
import { SessionErrorType } from '../session/error/SessionErrorType'
import { UserRoleType } from '../session/Role.type'
import { Middleware } from '../../../cat'

const AUTHORIZATION = 'Authorization'

type AuthorizedPathType = {
    [key: string]: UserRoleType[]
}

@Injectable()
export class SessionHandler implements Middleware {
    private readonly authorizedPath: AuthorizedPathType

    constructor(private readonly sessionManager: SessionManager) {
        this.authorizedPath = {}
    }

    public async handle(req: HttpRequest, res: HttpResponse, next: any) {
        const header = req.header

        if (!(req.path in this.authorizedPath)) {
            next()

            return
        }

        try {
            const userId = this.verify(header)
            req.setAuthenticated(userId)

            next()
        } catch (error) {
            next(error)
        }
    }

    public pathMatcher(path: string, ...roles: UserRoleType[]) {
        this.authorizedPath[path] = roles

        return this
    }

    private verify(header: object) {
        if (AUTHORIZATION in header) {
            const sessionId = header[AUTHORIZATION] as string

            return this.sessionManager.verify(sessionId)
        }

        throw new SessionError(SessionErrorType.NOT_FOUND_SESSION)
    }
}
