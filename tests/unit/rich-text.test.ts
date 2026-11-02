import { describe, expect, it } from "vitest";

import {
  sanitizeRichText,
  sanitizeRichTextFields,
} from "@/lib/admin/rich-text";
import { group, list, richtext, text } from "@/content/schemas";

describe("sanitizeRichText", () => {
  it.each([
    ["script elements", '<p>Safe</p><script>alert("bad")</script>', "script"],
    ["style elements", "<style>p { color: red }</style><p>Safe</p>", "style"],
    ["inline handlers", '<p onclick="alert(1)">Safe</p>', "onclick"],
    [
      "iframes",
      '<p>Safe</p><iframe src="https://bad.example">Bad</iframe>',
      "iframe",
    ],
  ])("removes %s", (_description, source, rejected) => {
    const result = sanitizeRichText(source);

    expect(result.toLowerCase()).not.toContain(rejected);
    expect(result).toContain("Safe");
  });

  it("keeps allowed structure and secures external links", () => {
    const result = sanitizeRichText(
      '<h2>Heading</h2><p><a href="https://example.test/path" target="_blank" rel="bad">Read more</a></p>',
    );

    expect(result).toContain("<h2>Heading</h2>");
    expect(result).toContain(
      '<a href="https://example.test/path" rel="noopener noreferrer" target="_blank">Read more</a>',
    );
  });

  it("sanitizes rich text inside groups and repeatable entries", () => {
    const fields = [
      richtext({
        name: "intro",
        label: "Introduction",
        hint: "Opening text",
      }),
      group({
        name: "details",
        label: "Details",
        hint: "Page details",
        fields: [
          text({
            name: "title",
            label: "Title",
            hint: "Short title",
          }),
          list({
            name: "entries",
            label: "Entries",
            hint: "Repeatable details",
            itemFields: [
              richtext({
                name: "body",
                label: "Text",
                hint: "Entry text",
              }),
            ],
          }),
        ],
      }),
    ] as const;
    const result = sanitizeRichTextFields(fields, {
      intro: '<p onclick="bad()">Hello</p>',
      details: {
        title: "Keep",
        entries: [
          { body: '<p style="color:red">Entry</p><script>bad()</script>' },
        ],
      },
    });

    expect(result.intro).toBe("<p>Hello</p>");
    expect(result.details).toEqual({
      title: "Keep",
      entries: [{ body: "<p>Entry</p>" }],
    });
  });
});
