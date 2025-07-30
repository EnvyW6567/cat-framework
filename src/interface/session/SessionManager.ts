import { v4 as uuid } from 'uuid'

import { Injectable } from '../../core/decorator/class/Injectable.decorator'
import { SessionErrorType } from './error/SessionErrorType'
import { SessionError } from './error/SessionError'

const weekMs = 1000 * 3600 * 24 * 7

type SessionDataType = {
    userId: number
    expiredAt: Date
}

type SessionType = {
    [key: string]: SessionDataType
}

@Injectable()
export class SessionManager {
    private readonly sessionStorage: SessionType

    constructor() {
        this.sessionStorage = {}
    }

    public verify(sessionId: string) {
        const sessionData = this.get(sessionId)

        if (sessionData.expiredAt < new Date()) {
            delete this.sessionStorage[sessionId]
            throw new SessionError(SessionErrorType.EXPIRED_SESSION_ID)
        }

        return sessionData.userId
    }

    public get(sessionId: string) {
        if (sessionId in this.sessionStorage) {
            return this.sessionStorage[sessionId]
        }
        throw new SessionError(SessionErrorType.INVALID_SESSION_ID)
    }

    public register(userId: number) {
        const curDate = new Date()
        const sessionId = this.generateSessionId()

        this.sessionStorage[sessionId] = {
            userId,
            expiredAt: new Date(curDate.getTime() + weekMs),
        }

        return sessionId
    }

    public remove(userId: number) {
        const sessionId = Object.keys(this.sessionStorage).find(
            (key) => this.sessionStorage[key].userId === userId,
        )

        if (sessionId) {
            delete this.sessionStorage[sessionId]

            return
        }
        throw new SessionError(SessionErrorType.NOT_FOUND_SESSION)
    }

    private generateSessionId() {
        return uuid()
    }
}
