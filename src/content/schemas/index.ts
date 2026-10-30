import { z } from "zod";

export type FieldBase = {
  name: string;
  label: string;
  hint?: string;
  required?: boolean;
};

export type TextField = FieldBase & { type: "text"; max?: number };
export type TextareaField = FieldBase & { type: "textarea"; max?: number };
export type RichtextField = FieldBase & { type: "richtext" };
export type ImageField = FieldBase & { type: "image" };
export type LinkField = FieldBase & { type: "link" };
export type NumberField = FieldBase & { type: "number"; min?: number; max?: number };
export type DateField = FieldBase & { type: "date" };
export type ToggleField = FieldBase & { type: "toggle" };
export type SelectField = FieldBase & {
  type: "select";
  options: { label: string; value: string }[];
};
export type GroupField = FieldBase & { type: "group"; fields: Field[] };
export type ListField = FieldBase & { type: "list"; itemFields: Field[] };
export type SeoField = FieldBase & { type: "seo" };

export type Field =
  | TextField
  | TextareaField
  | RichtextField
  | ImageField
  | LinkField
  | NumberField
  | DateField
  | ToggleField
  | SelectField
  | GroupField
  | ListField
  | SeoField;

export type PageSchema = {
  key: string;
  label: string;
  route: string;
  fields: Field[];
};

export function text(config: Omit<TextField, "type">): TextField {
  return { ...config, type: "text" };
}

export function textarea(config: Omit<TextareaField, "type">): TextareaField {
  return { ...config, type: "textarea" };
}

export function richtext(config: Omit<RichtextField, "type">): RichtextField {
  return { ...config, type: "richtext" };
}

export function image(config: Omit<ImageField, "type">): ImageField {
  return { ...config, type: "image" };
}

export function link(config: Omit<LinkField, "type">): LinkField {
  return { ...config, type: "link" };
}

export function number(config: Omit<NumberField, "type">): NumberField {
  return { ...config, type: "number" };
}

export function date(config: Omit<DateField, "type">): DateField {
  return { ...config, type: "date" };
}

export function toggle(config: Omit<ToggleField, "type">): ToggleField {
  return { ...config, type: "toggle" };
}

export function select(config: Omit<SelectField, "type">): SelectField {
  return { ...config, type: "select" };
}

export function group(config: Omit<GroupField, "type">): GroupField {
  return { ...config, type: "group" };
}

export function list(config: Omit<ListField, "type">): ListField {
  return { ...config, type: "list" };
}

export function seo(config: Omit<SeoField, "type">): SeoField {
  return { ...config, type: "seo" };
}

export function definePage(config: PageSchema): PageSchema {
  return config;
}

export function definePageFields(fields: Field[]): Field[] {
  return fields;
}

function fieldToZod(field: Field): z.ZodTypeAny {
  let schema: z.ZodTypeAny;

  switch (field.type) {
    case "text":
    case "textarea":
    case "richtext":
    case "link": {
      schema = z.string();
      if (field.max) schema = schema.max(field.max);
      break;
    }
    case "image": {
      schema = z.object({
        src: z.string().min(1),
        alt: z.string().min(1),
        label: z.string().min(1),
        tone: z.string(),
        ratio: z.string().optional(),
      });
      break;
    }
    case "number": {
      schema = z.number();
      if (field.min !== undefined) schema = schema.min(field.min);
      if (field.max !== undefined) schema = schema.max(field.max);
      break;
    }
    case "date": {
      schema = z.string().datetime({ offset: true }).optional();
      break;
    }
    case "toggle": {
      schema = z.boolean();
      break;
    }
    case "select": {
      schema = z.enum(field.options.map((option) => option.value));
      break;
    }
    case "group": {
      schema = z.object(buildFieldShape(field.fields));
      break;
    }
    case "list": {
      schema = z.array(z.object(buildFieldShape(field.itemFields)));
      break;
    }
    case "seo": {
      schema = z.object({
        title: z.string().max(70).optional(),
        description: z.string().max(160).optional(),
      });
      break;
    }
  }

  if (field.required && field.type !== "date" && field.type !== "seo") {
    if (field.type === "text" || field.type === "textarea" || field.type === "richtext" || field.type === "image" || field.type === "link") {
      schema = (schema as z.ZodString).min(1);
    }
  }

  if (!field.required) {
    schema = schema.optional();
  }

  return schema;
}

function buildFieldShape(fields: Field[]) {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const field of fields) {
    shape[field.name] = fieldToZod(field);
  }
  return shape;
}

export function buildValidator(schema: PageSchema) {
  return z.object(buildFieldShape(schema.fields));
}

export type ImagePhoto = {
  src: string;
  alt: string;
  label: string;
  tone: string;
  ratio?: string;
};

export type PageFields<Fields extends Field[]> = {
  [Field in Fields[number] as Field["name"]]: Field extends TextField
    ? string
    : Field extends TextareaField
    ? string
    : Field extends RichtextField
    ? string
    : Field extends ImageField
    ? ImagePhoto | null
    : Field extends LinkField
    ? string | null
    : Field extends NumberField
    ? number
    : Field extends DateField
    ? string
    : Field extends ToggleField
    ? boolean
    : Field extends SelectField
    ? string
    : Field extends GroupField
    ? PageFields<Field["fields"]>
    : Field extends ListField
    ? PageFields<Field["itemFields"]>[]
    : Field extends SeoField
    ? { title?: string; description?: string }
    : never;
};
