import { definePage, image, link, seo, text, textarea, toggle } from "./index";

export const settingsSchema = definePage({
  key: "settings",
  label: "Site settings",
  route: "/admin/settings",
  fields: [
    text({ name: "schoolName", label: "School name", hint: "Shown in the header and footer", required: true, max: 100 }),
    text({ name: "motto", label: "Motto", hint: "The school motto", max: 100 }),
    text({ name: "metaTitle", label: "SEO title", hint: "Shown in browser tabs and search results", max: 70 }),
    textarea({ name: "metaDescription", label: "SEO description", hint: "Shown in search results", max: 160 }),
    text({ name: "address", label: "Address", max: 200 }),
    text({ name: "city", label: "City", max: 100 }),
    text({ name: "district", label: "District", max: 100 }),
    text({ name: "country", label: "Country", max: 100 }),
    text({ name: "applyHref", label: "Apply link", hint: "Web address for the application form", max: 200 }),
    text({ name: "contactHref", label: "Contact link", hint: "Web address for the contact page", max: 200 }),
    text({ name: "whatsappMessage", label: "WhatsApp message", hint: "Prefilled message sent when a visitor chats", max: 300 }),
    toggle({ name: "applicationsOpen", label: "Applications open", hint: "When closed, the apply form shows the closed message instead" }),
    image({ name: "logo", label: "School logo", hint: "Shown in the header" }),
    seo({ name: "seo", label: "SEO" }),
  ],
});
