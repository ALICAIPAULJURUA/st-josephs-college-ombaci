const originalFetch = globalThis.fetch;

globalThis.fetch = async (input, init) => {
  if (input === "https://challenges.cloudflare.com/turnstile/v0/siteverify") {
    return Response.json({ success: true });
  }

  return originalFetch(input, init);
};
