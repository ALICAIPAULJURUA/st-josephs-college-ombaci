import { describe, expect, it } from "vitest";

import { homePageDefaults } from "@/content/defaults/home";
import {
  ensureRequestedPrimaryNavigation,
  requestedPrimaryNavigation,
  settingsDefaults,
} from "@/content/defaults/site";
import {
  buildValidator,
  date,
  definePage,
  link,
  number,
  richtext,
  select,
} from "@/content/schemas";
import { homePageSchema } from "@/content/schemas/home";
import { settingsSchema } from "@/content/schemas/settings";
import { contentItemPath, isSafeContentPath } from "@/lib/content-path";

const fieldTypesSchema = definePage({
  key: "field-types",
  label: "Field types",
  route: "/",
  fields: [
    richtext({
      name: "body",
      label: "Body",
      hint: "Main body text",
      required: true,
    }),
    link({
      name: "callToAction",
      label: "Call to action",
      hint: "Link label and address",
      required: true,
    }),
    number({
      name: "count",
      label: "Count",
      hint: "A number between zero and ten",
      required: true,
      min: 0,
      max: 10,
    }),
    date({
      name: "eventDate",
      label: "Event date",
      hint: "Date in ISO format",
      required: true,
    }),
    select({
      name: "status",
      label: "Status",
      hint: "Choose an allowed status",
      required: true,
      options: [
        { label: "Open", value: "open" },
        { label: "Closed", value: "closed" },
      ],
    }),
  ],
});

describe("content schema validators", () => {
  it("accepts the Settings defaults", () => {
    expect(
      buildValidator(settingsSchema).safeParse(settingsDefaults).success,
    ).toBe(true);
  });

  it("adds the requested links to existing saved navigation without duplicates", () => {
    const savedNavigation = settingsDefaults.navigation.primary.filter(
      (item) =>
        !requestedPrimaryNavigation.some((link) => link.href === item.href),
    );
    const mergedNavigation = ensureRequestedPrimaryNavigation(savedNavigation);

    expect(mergedNavigation.slice(0, 3)).toEqual(requestedPrimaryNavigation);
    expect(
      mergedNavigation.filter((item) =>
        requestedPrimaryNavigation.some((link) => link.href === item.href),
      ),
    ).toHaveLength(3);
    expect(ensureRequestedPrimaryNavigation(mergedNavigation)).toEqual(
      mergedNavigation,
    );
  });

  it("accepts the Home defaults, including sample photos and string lists", () => {
    expect(
      buildValidator(homePageSchema).safeParse(homePageDefaults).success,
    ).toBe(true);
  });

  it("rejects invalid required and nested list fields", () => {
    const invalidHome = {
      ...homePageDefaults,
      hero: { ...homePageDefaults.hero, title: "" },
      panels: [{ ...homePageDefaults.panels[0], label: "" }],
    };

    expect(buildValidator(homePageSchema).safeParse(invalidHome).success).toBe(
      false,
    );
  });

  it("validates rich text, links, numbers, dates, and select options", () => {
    const validator = buildValidator(fieldTypesSchema);
    const validData = {
      body: "<p>School information</p>",
      callToAction: { label: "Visit", href: "/about" },
      count: 10,
      eventDate: "2026-10-30",
      status: "open",
    };

    expect(validator.safeParse(validData).success).toBe(true);
    expect(
      validator.safeParse({
        ...validData,
        callToAction: { label: "", href: "" },
        count: 11,
        status: "other",
      }).success,
    ).toBe(false);
  });

  it("only creates canonical internal paths for content items", () => {
    expect(contentItemPath("news", "approved-story")).toBe(
      "/news/approved-story",
    );
    expect(
      contentItemPath("extra-pages", "school-policy", {
        route: "/school/policy",
      }),
    ).toBe("/school/policy");
    expect(
      contentItemPath("extra-pages", "school-policy", {
        route: "//example.com",
      }),
    ).toBeNull();
    expect(isSafeContentPath("/school/policy")).toBe(true);
    expect(isSafeContentPath("/school/../policy")).toBe(false);
  });
});
