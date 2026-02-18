export const config = {
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET ?? "access-secret-change-in-production",
    refreshSecret: process.env.JWT_REFRESH_SECRET ?? "refresh-secret-change-in-production",
    accessExpiresIn: "15m",
    refreshExpiresIn: "7d",
    refreshCookieName: "refreshToken",
  },
  bcryptRounds: 12,
} as const;
