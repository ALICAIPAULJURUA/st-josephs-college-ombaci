import { isEmailConfigured } from "./email";

export function isApplicationSubmissionConfigured(
  environment: NodeJS.ProcessEnv = process.env,
) {
  if (
    !environment.TURNSTILE_SITE_KEY?.trim() ||
    !environment.TURNSTILE_SECRET_KEY?.trim() ||
    !isEmailConfigured(environment) ||
    !environment.SESSION_SECRET ||
    environment.SESSION_SECRET.length < 32
  ) {
    return false;
  }

  if (
    environment.NODE_ENV === "production" &&
    (!environment.DATABASE_URL?.trim() ||
      !environment.APPLICATION_PRIVATE_STORAGE_DIR?.trim())
  ) {
    return false;
  }

  return true;
}
