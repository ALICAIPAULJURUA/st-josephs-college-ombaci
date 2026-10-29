import type { CollectionConfig } from "payload";
import { contentEditors, publishedOrAuthenticated } from "./access";
import {
  contentAdmin,
  contentHooks,
  contentVersions,
  editorialStatusField,
  mediaField,
  publishedAtField,
  richText,
  seoField,
  slugField,
} from "./shared";

export const Pages: CollectionConfig = {
  slug: "pages",
  admin: {
    ...contentAdmin,
    description: "Long-form pages such as About, Admissions and Student Life.",
  },
  access: {
    read: publishedOrAuthenticated,
    create: contentEditors,
    update: contentEditors,
    delete: contentEditors,
  },
  versions: contentVersions,
  hooks: contentHooks,
  fields: [
    { name: "title", type: "text", required: true },
    slugField(),
    { name: "summary", type: "textarea", maxLength: 320 },
    mediaField("heroImage", "Hero image"),
    {
      name: "layout",
      type: "blocks",
      labels: { singular: "Section", plural: "Sections" },
      blocks: [
        {
          slug: "text",
          labels: { singular: "Text", plural: "Text sections" },
          fields: [richText("content", "Text")],
        },
        {
          slug: "imageText",
          labels: { singular: "Image and text", plural: "Image and text sections" },
          fields: [
            mediaField("image", "Image"),
            { name: "heading", type: "text" },
            richText("body", "Text"),
            {
              name: "imagePosition",
              type: "select",
              defaultValue: "left",
              options: [
                { label: "Left", value: "left" },
                { label: "Right", value: "right" },
              ],
            },
          ],
        },
        {
          slug: "features",
          labels: { singular: "Feature grid", plural: "Feature grids" },
          fields: [
            { name: "heading", type: "text" },
            {
              name: "items",
              type: "array",
              fields: [
                { name: "title", type: "text", required: true },
                { name: "body", type: "textarea" },
              ],
            },
          ],
        },
        {
          slug: "stats",
          labels: { singular: "Numbers", plural: "Number sections" },
          fields: [
            { name: "heading", type: "text" },
            {
              name: "items",
              type: "array",
              fields: [
                { name: "value", type: "text", required: true },
                { name: "label", type: "text", required: true },
              ],
            },
          ],
        },
        {
          slug: "gallery",
          labels: { singular: "Gallery", plural: "Galleries" },
          fields: [
            { name: "heading", type: "text" },
            {
              name: "images",
              type: "array",
              fields: [mediaField("image", "Image")],
            },
          ],
        },
        {
          slug: "callToAction",
          labels: { singular: "Call to action", plural: "Calls to action" },
          fields: [
            { name: "heading", type: "text", required: true },
            { name: "body", type: "textarea" },
            { name: "linkLabel", type: "text", required: true },
            { name: "linkHref", type: "text", required: true },
          ],
        },
      ],
    },
    seoField,
    editorialStatusField,
    publishedAtField,
  ],
};
