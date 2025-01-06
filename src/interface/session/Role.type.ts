export const USER_ROLE = ["ROLE_ADMIN", "ROLE_USER"] as const;

export type UserRoleType = typeof USER_ROLE[number];