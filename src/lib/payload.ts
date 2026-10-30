import { getPayload } from "payload";

export async function getPayloadClient() {
  const { default: payloadConfig } = await import("@payload-config");
  return getPayload({ config: payloadConfig });
}
