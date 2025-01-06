export const SessionErrorType = {
    INVALID_SESSION_ID: {
        name: 'INVALID_SESSION_ID',
        code: 401,
        message: 'invalid sessionId',
    },
    EXPIRED_SESSION_ID: {
        name: 'EXPIRED_SESSION_ID',
        code: 401,
        message: 'expired sessionId login again',
    },
    NOT_FOUND_SESSION: {
        name: 'NOT_FOUND_SESSION',
        code: 400,
        message: 'not found session',
    },
} as const;
