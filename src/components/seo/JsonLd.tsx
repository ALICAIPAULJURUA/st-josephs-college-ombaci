import { headers } from "next/headers";

export function siteOrigin() {
  return new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000")
    .origin;
}

export async function JsonLd({ data }: { data: unknown }) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  const json = JSON.stringify(data).replace(
    /[<>&\u2028\u2029]/g,
    (character) => {
      const escapes: Record<string, string> = {
        "<": "\\u003c",
        ">": "\\u003e",
        "&": "\\u0026",
        "\u2028": "\\u2028",
        "\u2029": "\\u2029",
      };
      return escapes[character] ?? character;
    },
  );

  return (
    <script
      type="application/ld+json"
      nonce={nonce}
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
