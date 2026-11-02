import { z } from "zod";

export type FieldBase = {
  name: string;
  label: string;
  hint: string;
  required?: boolean;
};

export type TextField = FieldBase & { type: "text"; max?: number };
export type TextareaField = FieldBase & { type: "textarea"; max?: number };
export type RichtextField = FieldBase & { type: "richtext" };
export type ImageField = FieldBase & { type: "image" };
export type LinkField = FieldBase & { type: "link" };
export type NumberField = FieldBase & {
  type: "number";
  min?: number;
  max?: number;
};
export type DateField = FieldBase & { type: "date" };
export type ToggleField = FieldBase & { type: "toggle" };
export type SelectField = FieldBase & {
  type: "select";
  options: readonly { label: string; value: string }[];
};
export type GroupField = FieldBase & {
  type: "group";
  fields: readonly Field[];
};
export type ObjectListField = FieldBase & {
  type: "list";
  itemFields: readonly Field[];
};
export type TextListField = FieldBase & {
  type: "list";
  itemType: "text";
  max?: number;
};
export type ListField = ObjectListField | TextListField;
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
  template?: PageTemplate;
  collection?: string;
  fields: readonly Field[];
};

export type PageTemplate =
  | "story"
  | "info"
  | "resources"
  | "listing"
  | "detail"
  | "contact";

type FieldConfig<T extends Field> = Omit<T, "type">;

function typedField<
  const Type extends Field["type"],
  const Config extends { name: string },
>(type: Type, config: Config): Config & { type: Type } {
  return { ...config, type };
}

export function text<const Config extends FieldConfig<TextField>>(
  config: Config,
) {
  return typedField("text", config);
}

export function textarea<const Config extends FieldConfig<TextareaField>>(
  config: Config,
) {
  return typedField("textarea", config);
}

export function richtext<const Config extends FieldConfig<RichtextField>>(
  config: Config,
) {
  return typedField("richtext", config);
}

export function image<const Config extends FieldConfig<ImageField>>(
  config: Config,
) {
  return typedField("image", config);
}

export function link<const Config extends FieldConfig<LinkField>>(
  config: Config,
) {
  return typedField("link", config);
}

export function number<const Config extends FieldConfig<NumberField>>(
  config: Config,
) {
  return typedField("number", config);
}

export function date<const Config extends FieldConfig<DateField>>(
  config: Config,
) {
  return typedField("date", config);
}

export function toggle<const Config extends FieldConfig<ToggleField>>(
  config: Config,
) {
  return typedField("toggle", config);
}

export function select<const Config extends FieldConfig<SelectField>>(
  config: Config,
) {
  return typedField("select", config);
}

export function group<const Config extends FieldConfig<GroupField>>(
  config: Config,
) {
  return typedField("group", config);
}

export function list<
  const Config extends
    FieldConfig<ObjectListField> | FieldConfig<TextListField>,
>(config: Config) {
  return typedField("list", config);
}

export function seo<const Config extends FieldConfig<SeoField>>(
  config: Config,
) {
  return typedField("seo", config);
}

export function definePage<const Schema extends PageSchema>(
  config: Schema,
): Schema {
  return config;
}

export function definePageFields<const Fields extends readonly Field[]>(
  fields: Fields,
): Fields {
  return fields;
}

function fieldToZod(field: Field): z.ZodType {
  let schema: z.ZodType;

  switch (field.type) {
    case "text":
    case "textarea":
    case "richtext": {
      let value = z.string();
      if ("max" in field && field.max !== undefined)
        value = value.max(field.max);
      if (field.required) value = value.min(1);
      schema = value;
      break;
    }
    case "image": {
      schema = z.object({
        src: z.string().min(1).optional(),
        alt: z.string().min(1),
        label: z.string().min(1),
        tone: z.string().min(1),
        ratio: z.string().min(1).optional(),
      });
      break;
    }
    case "link": {
      schema = z.object({
        label: z.string().min(1),
        href: z.string().min(1),
      });
      break;
    }
    case "number": {
      let value = z.number();
      if (field.min !== undefined) value = value.min(field.min);
      if (field.max !== undefined) value = value.max(field.max);
      schema = value;
      break;
    }
    case "date": {
      schema = z.iso.date().or(z.iso.datetime({ offset: true }));
      break;
    }
    case "toggle": {
      schema = z.boolean();
      break;
    }
    case "select": {
      schema =
        field.options.length > 0
          ? z.enum(
              field.options.map((option) => option.value) as [
                string,
                ...string[],
              ],
            )
          : z.never();
      break;
    }
    case "group": {
      schema = z.object(buildFieldShape(field.fields));
      break;
    }
    case "list": {
      schema =
        "itemFields" in field
          ? z.array(z.object(buildFieldShape(field.itemFields)))
          : z.array(
              field.max === undefined ? z.string() : z.string().max(field.max),
            );
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

  if (!field.required) schema = schema.optional();

  return schema;
}

function buildFieldShape(fields: readonly Field[]) {
  const shape: Record<string, z.ZodType> = {};
  for (const field of fields) shape[field.name] = fieldToZod(field);
  return shape;
}

export function buildValidator<const Schema extends PageSchema>(
  schema: Schema,
): z.ZodType<PageFields<Schema["fields"]>> {
  return z.object(buildFieldShape(schema.fields)) as unknown as z.ZodType<
    PageFields<Schema["fields"]>
  >;
}

export type ImagePhoto = {
  src?: string;
  alt: string;
  label: string;
  tone: string;
  ratio?: string;
};

type FieldValue<CurrentField extends Field> = CurrentField extends
  TextField | TextareaField | RichtextField
  ? string
  : CurrentField extends ImageField
    ? ImagePhoto
    : CurrentField extends LinkField
      ? { label: string; href: string }
      : CurrentField extends NumberField
        ? number
        : CurrentField extends DateField
          ? string
          : CurrentField extends ToggleField
            ? boolean
            : CurrentField extends SelectField
              ? CurrentField["options"][number]["value"]
              : CurrentField extends GroupField
                ? PageFields<CurrentField["fields"]>
                : CurrentField extends TextListField
                  ? string[]
                  : CurrentField extends ObjectListField
                    ? PageFields<CurrentField["itemFields"]>[]
                    : CurrentField extends SeoField
                      ? { title?: string; description?: string }
                      : never;

type RequiredFieldValues<Fields extends readonly Field[]> = {
  [
    Item in Fields[number] as Item extends { required: true }
      ? Item["name"]
      : never
  ]: FieldValue<Item>;
};

type OptionalFieldValues<Fields extends readonly Field[]> = {
  [
    Item in Fields[number] as Item extends { required: true }
      ? never
      : Item["name"]
  ]?: FieldValue<Item>;
};

export type PageFields<Fields extends readonly Field[]> =
  RequiredFieldValues<Fields> & OptionalFieldValues<Fields>;
