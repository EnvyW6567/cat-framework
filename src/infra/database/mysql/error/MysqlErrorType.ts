export const MysqlErrorType = {
    CONNECTION_FAILED: {
        name: 'CONNECTION_FAILED',
        code: 500,
        message: 'Mysql server connection failed',
        fatal: true,
    },
    QUERY_FAILED: {
        name: 'QUERY_FAILED',
        code: 500,
        message: 'Mysql query failed.',
    },
    CONNECTION_NOT_FOND: {
        name: 'CONNECTION_NOT_FOND',
        code: 500,
        message: 'Mysql server connection not found. Connect mysql server first.',
    },
} as const;
