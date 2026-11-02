export class TurnstileError extends Error {
  constructor(
    message = "Please complete the security check and try again.",
    readonly status: 400 | 503 = 400,
  ) {
    super(message);
    this.name = "TurnstileError";
  }
}

export async function verifyTurnstile(token: string, remoteIp: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    throw new TurnstileError(
      "The security check is not configured. Please contact the school.",
      503,
    );
  }

  const body = new URLSearchParams({
    secret,
    response: token,
    remoteip: remoteIp,
  });
  let response: Response;
  try {
    response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        body,
        cache: "no-store",
        signal: AbortSignal.timeout(10_000),
      },
    );
  } catch {
    throw new TurnstileError(
      "The security check is temporarily unavailable. Please try again.",
      503,
    );
  }

  if (!response.ok) {
    throw new TurnstileError(
      "The security check is temporarily unavailable. Please try again.",
      503,
    );
  }

  let result: unknown;
  try {
    result = await response.json();
  } catch {
    throw new TurnstileError(
      "The security check is temporarily unavailable. Please try again.",
      503,
    );
  }
  if (
    !result ||
    typeof result !== "object" ||
    !("success" in result) ||
    result.success !== true
  ) {
    throw new TurnstileError();
  }
}
