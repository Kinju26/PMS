export const SESSION_COOKIE = "cpos.sid";
export const CREDENTIAL_COOKIE = "cpos.cred";
export const MFA_COOKIE = "cpos.mfa";
export const MIN_NEW_PASSWORD_LENGTH = 10;

export const SESSION_TTL_SECONDS = 60 * 60 * 8;
export const REMEMBER_TTL_SECONDS = 60 * 60 * 24 * 30;
export const IDLE_TTL_SECONDS = 60 * 30;
export const RESET_TTL_SECONDS = 60 * 30;
export const MFA_TTL_SECONDS = 60 * 5;

export const MAX_FAILED_ATTEMPTS = 5;
export const LOCKOUT_MINUTES = 15;
export const GENERIC_AUTH_ERROR = "Invalid credentials or this account cannot sign in.";
