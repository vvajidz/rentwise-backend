export const ROLES = {
  TENANT: "tenant",
  OWNER: "owner",
  ADMIN: "admin"
} as const;

export type RoleType = (typeof ROLES)[keyof typeof ROLES]
