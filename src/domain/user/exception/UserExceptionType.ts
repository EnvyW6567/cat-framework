export const UserExceptionType = {
    EMAIL_ALREADY_EXISTS: {
        name: "EMAIL_ALREADY_EXISTS",
        code: 400,
        message: "Email already exists"
    },
    INVALID_INPUT: {
        name: "INVALID_INPUT",
        code: 400,
        message: "Missing required fields"
    },
    INVALID_EMAIL: {
        name: "INVALID_EMAIL",
        code: 400,
        message: "Invalid email format"
    },
    INVALID_PASSWORD: {
        name: "INVALID_PASSWORD",
        code: 400,
        message: "Password must be at least 8 characters long"
    },
    INVALID_NAME: {
        name: "INVALID_NAME",
        code: 400,
        message: "Name must be at least 2 characters long"
    },
    LOGIN_FAILED: {
        name: "LOGIN_FAILED",
        code: 400,
        message: "Invalid email, password"
    },
    INVALID_USER_DATA: {
        name: "INVALID_USER_DATA",
        code: 500,
        message: "something wrong with query data"
    },
    SIGNUP_ERROR: {
        name: "SIGNUP_ERROR",
        code: 500,
        message: "user signup failed. not found user by email"
    }
}