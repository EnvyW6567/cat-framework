export const HttpExceptionType = {
    INVALID_HTTP_STARTLINE: {
        name: "INVALID_HTTP_STARTLINE",
        code: 400,
        message: "invalid http header start line"
    },
    INVALID_HTTP_METHOD: {
        name: "INVALID_HTTP_METHOD",
        code: 405,
        message: "invalid http method."
    },
    INVALID_JSON_TYPE: {
        name: "INVALID_JSON_TYPE",
        code: 400,
        message: "response body json parse error. invalid json type"
    },
    INVALID_HTTP_VERSION: {
        name: "INVALID_HTTP_VERSION",
        code: 505,
        message: "this http version not supported."
    },
    BAD_HTTP_HEADER_TYPE: {
        name: "BAD_HTTP_HEADER_TYPE",
        code: 400,
        message: "wrong http header. check request header type. is it key: value?"
    },
    NOT_FOUND: {
        name: "NOT_FOUND",
        code: 404,
        message: "request path not found"
    },
    AUTHENTICATED_FAILED: {
        name: "AUTHENTICATED_FAILED",
        code: 401,
        message: "not authenticated"
    },
    NOT_SUPPORT_EXTENSION: {
        name: "NOT_SUPPORT_EXTENSION",
        code: 400,
        message: "resource type not supported"
    },
    INVALID_FILE_TYPE: {
        name: "INVALID_FILE_TYPE",
        code: 400,
        message: "invalid file type"
    },
    NOT_FOUND_REQUEST: {
        name: "NOT_FOUND_REQUEST",
        code: 400,
        message: "request not found"
    }
} as const


