"use client";

import Script from "next/script";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ChangeEvent,
  type FormEvent,
} from "react";
import Link from "next/link";

import {
  applicationDocumentDefinitions,
  applicationDocumentGroup,
  applicationFieldDefinitions,
  applicationFieldsSchema,
  type ApplicationDocumentName,
  type ApplicationFieldName,
  type ApplicationFields,
} from "@/content/schemas/application-fields";

declare global {
  interface Window {
    turnstile?: {
      render(
        container: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "expired-callback": () => void;
          "error-callback": () => void;
        },
      ): string;
      remove(widgetId: string): void;
      reset(widgetId: string): void;
    };
  }
}

type Draft = Omit<
  ApplicationFields,
  "consent" | "gender" | "gradeApplyingFor"
> & {
  gender: string;
  gradeApplyingFor: string;
  consent: boolean;
};
type FieldName = Exclude<ApplicationFieldName, "consent">;
type ApplicationField =
  (typeof applicationFieldDefinitions)[number]["fields"][number];
type ApplicationFieldGroup = (typeof applicationFieldDefinitions)[number];
type DocumentDraft = Record<ApplicationDocumentName, File | null>;

const draftStorageKey = "ombaci-application-draft-v2";
const draftChangedEvent = "ombaci:application-draft-changed";

const emptyDraft: Draft = {
  studentFirstName: "",
  studentLastName: "",
  dateOfBirth: "",
  gender: "",
  gradeApplyingFor: "",
  previousSchool: "",
  guardianFirstName: "",
  guardianLastName: "",
  guardianEmail: "",
  guardianPhone: "",
  guardianAddress: "",
  guardianOccupation: "",
  emergencyContactName: "",
  emergencyContactPhone: "",
  emergencyContactRelationship: "",
  medicalConditions: "",
  allergies: "",
  additionalNotes: "",
  consent: false,
};

const emptyDocuments: DocumentDraft = {
  birthCertificate: null,
  previousReportCard: null,
  immunizationRecords: null,
};

function isDraft(value: unknown): value is Partial<Draft> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const allowedFields = new Set(Object.keys(emptyDraft));
  return Object.entries(value).every(
    ([key, entry]) =>
      allowedFields.has(key) &&
      (key === "consent"
        ? typeof entry === "boolean"
        : typeof entry === "string"),
  );
}

function subscribeToDraft(callback: () => void) {
  window.addEventListener(draftChangedEvent, callback);
  return () => window.removeEventListener(draftChangedEvent, callback);
}

function getDraftSnapshot() {
  try {
    return sessionStorage.getItem(draftStorageKey) ?? "";
  } catch {
    return "";
  }
}

function getDraftServerSnapshot() {
  return "";
}

function parseDraft(snapshot: string): Draft {
  if (!snapshot) return emptyDraft;
  try {
    const parsed: unknown = JSON.parse(snapshot);
    return isDraft(parsed) ? { ...emptyDraft, ...parsed } : emptyDraft;
  } catch {
    return emptyDraft;
  }
}

function storeDraft(draft: Draft) {
  try {
    sessionStorage.setItem(draftStorageKey, JSON.stringify(draft));
    window.dispatchEvent(new Event(draftChangedEvent));
  } catch {
    return false;
  }
  return true;
}

function clearDraft() {
  try {
    sessionStorage.removeItem(draftStorageKey);
    window.dispatchEvent(new Event(draftChangedEvent));
  } catch {
    return;
  }
}

function errorText(value: unknown) {
  return value instanceof Error
    ? value.message
    : "The application could not be submitted. Please try again.";
}

function FormField({
  field,
  draft,
  errors,
  update,
}: {
  field: ApplicationField;
  draft: Draft;
  errors: Record<string, string>;
  update: (name: FieldName, value: string) => void;
}) {
  const name = field.name as FieldName;
  const value = draft[name];
  const error = errors[name];
  const optional = "optional" in field && field.optional;
  const id = `application-${name}`;
  const placeholder = "placeholder" in field ? field.placeholder : undefined;
  const commonProps = {
    id,
    name,
    required: !optional,
    value,
    placeholder,
    "aria-invalid": Boolean(error),
    "aria-describedby": error ? `${id}-error` : undefined,
    onChange: (
      event: ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) => update(name, event.currentTarget.value),
  };

  return (
    <label className="grid min-w-0 gap-2 font-semibold" htmlFor={id}>
      <span>
        {field.label}
        {!optional ? " *" : ""}
      </span>
      {field.type === "select" ? (
        <select
          {...commonProps}
          className="min-h-12 border-2 border-navy bg-white px-3 text-ink"
        >
          <option value="">{placeholder ?? "Select an option"}</option>
          {field.options?.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : field.type === "textarea" ? (
        <textarea
          {...commonProps}
          className="min-h-28 border-2 border-navy bg-white px-3 py-2 text-ink"
          maxLength={
            name === "medicalConditions" ||
            name === "allergies" ||
            name === "additionalNotes"
              ? 2000
              : 300
          }
        />
      ) : (
        <input
          {...commonProps}
          className="min-h-12 min-w-0 border-2 border-navy bg-white px-3 text-ink"
          lang={name === "dateOfBirth" ? "en-GB" : undefined}
          maxLength={300}
          type={field.type}
        />
      )}
      {error ? (
        <span className="text-sm font-normal text-red" id={`${id}-error`}>
          {error}
        </span>
      ) : null}
    </label>
  );
}

function ApplicationFieldSection({
  group,
  draft,
  errors,
  update,
}: {
  group: ApplicationFieldGroup;
  draft: Draft;
  errors: Record<string, string>;
  update: (name: FieldName, value: string) => void;
}) {
  return (
    <fieldset className="grid min-w-0 gap-5 border-2 border-navy bg-white p-5 sm:p-6">
      <legend className="px-2 text-2xl font-bold text-navy">
        {group.label}
      </legend>
      <p className="-mt-2 text-sm leading-6 text-ink">{group.description}</p>
      <div className="grid min-w-0 gap-5 sm:grid-cols-2">
        {group.fields.map((field) => (
          <FormField
            draft={draft}
            errors={errors}
            field={field}
            key={field.name}
            update={update}
          />
        ))}
      </div>
    </fieldset>
  );
}

export function ApplicationForm({
  siteKey,
  consentHtml,
  submissionReady,
}: {
  siteKey: string;
  consentHtml: string;
  submissionReady: boolean;
}) {
  const router = useRouter();
  const draftSnapshot = useSyncExternalStore(
    subscribeToDraft,
    getDraftSnapshot,
    getDraftServerSnapshot,
  );
  const draft = parseDraft(draftSnapshot);
  const [documents, setDocuments] = useState<DocumentDraft>(emptyDocuments);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [scriptReady, setScriptReady] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const turnstileContainer = useRef<HTMLDivElement>(null);
  const turnstileWidgetId = useRef<string | null>(null);
  const informationGroups = applicationFieldDefinitions.filter(
    (group) => group.label !== "Additional Notes",
  );
  const additionalNotesGroup = applicationFieldDefinitions.find(
    (group) => group.label === "Additional Notes",
  );

  function persistDraft(next: Draft) {
    if (storeDraft(next)) {
      setMessage("");
      return;
    }
    setMessage(
      "Your progress could not be saved in this browser session. Keep this page open while you apply.",
    );
  }

  useEffect(() => {
    if (!scriptReady || !turnstileContainer.current || !window.turnstile) {
      return;
    }

    const widgetId = window.turnstile.render(turnstileContainer.current, {
      sitekey: siteKey,
      callback: (token) => {
        setTurnstileToken(token);
      },
      "expired-callback": () => setTurnstileToken(""),
      "error-callback": () => {
        setTurnstileToken("");
        setMessage("The security check did not load. Please try again.");
      },
    });
    turnstileWidgetId.current = widgetId;

    return () => {
      window.turnstile?.remove(widgetId);
      turnstileWidgetId.current = null;
    };
  }, [scriptReady, siteKey]);

  function updateField(name: FieldName, value: string) {
    persistDraft({ ...draft, [name]: value });
    setErrors((current) => {
      const next = { ...current };
      delete next[name];
      return next;
    });
  }

  function changeDocument(
    name: ApplicationDocumentName,
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.currentTarget.files?.[0] ?? null;
    if (file && file.size > 5 * 1024 * 1024) {
      setErrors((current) => ({
        ...current,
        [name]: "Each document must be no larger than 5 MB.",
      }));
      event.currentTarget.value = "";
      return;
    }
    if (
      file &&
      !["application/pdf", "image/jpeg", "image/png"].includes(file.type)
    ) {
      setErrors((current) => ({
        ...current,
        [name]: "Choose a PDF, JPG, or PNG document.",
      }));
      event.currentTarget.value = "";
      return;
    }
    setErrors((current) => {
      const next = { ...current };
      delete next[name];
      return next;
    });
    setDocuments((current) => ({ ...current, [name]: file }));
  }

  async function submitApplication(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    if (!submissionReady) {
      setMessage(
        "Online applications are temporarily unavailable. Please contact the school.",
      );
      return;
    }
    const validation = applicationFieldsSchema.safeParse(draft);
    if (!validation.success) {
      const fieldErrors = Object.fromEntries(
        validation.error.issues.map((issue) => [
          String(issue.path[0]),
          issue.message,
        ]),
      );
      setErrors(fieldErrors);
      const firstInvalidField = validation.error.issues[0]?.path[0];
      if (typeof firstInvalidField === "string") {
        document
          .getElementById(`application-${firstInvalidField}`)
          ?.focus({ preventScroll: false });
      }
      return;
    }
    if (!turnstileToken) {
      setMessage("Complete the security check before submitting.");
      return;
    }

    setSubmitting(true);
    const data = new FormData();
    data.set("application", JSON.stringify(validation.data));
    data.set("turnstileToken", turnstileToken);
    for (const [name, file] of Object.entries(documents)) {
      if (file) data.set(name, file);
    }

    try {
      const response = await fetch("/api/apply", {
        method: "POST",
        body: data,
      });
      let result: unknown;
      try {
        result = await response.json();
      } catch {
        throw new Error(
          "The application could not be submitted. Please try again.",
        );
      }
      const serverMessage =
        result &&
        typeof result === "object" &&
        "error" in result &&
        typeof result.error === "string"
          ? result.error
          : "The application could not be submitted. Please try again.";
      if (!response.ok) throw new Error(serverMessage);
      if (
        !result ||
        typeof result !== "object" ||
        !("reference" in result) ||
        typeof result.reference !== "string" ||
        !("applicationReceived" in result) ||
        result.applicationReceived !== true
      ) {
        throw new Error(
          "The application service did not confirm receipt. Please try again.",
        );
      }

      clearDraft();
      const notice =
        "message" in result && typeof result.message === "string"
          ? "&notice=email"
          : "";
      router.push(
        `/apply/confirmation?reference=${encodeURIComponent(result.reference)}${notice}`,
      );
    } catch (error) {
      setMessage(errorText(error));
      setSubmitting(false);
      setTurnstileToken("");
      if (turnstileWidgetId.current) {
        window.turnstile?.reset(turnstileWidgetId.current);
      }
    }
  }

  return (
    <section className="mx-auto max-w-[920px] px-5 py-10 sm:px-10">
      {siteKey ? (
        <Script
          onLoad={() => setScriptReady(true)}
          src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
          strategy="afterInteractive"
        />
      ) : null}
      <p className="mb-5 border-l-4 border-yellow bg-mist p-4 text-sm leading-6">
        Submitted information is used to review the application and contact the
        parent or guardian. The school still needs to confirm document
        requirements and the retention period; see the{" "}
        <Link className="font-bold underline" href="/privacy">
          privacy notice
        </Link>
        .
      </p>

      <form className="grid gap-6" noValidate onSubmit={submitApplication}>
        {!submissionReady ? (
          <p className="border-l-4 border-red bg-[#fff3f3] p-4" role="status">
            Online applications are temporarily unavailable. Please{" "}
            <Link className="font-bold underline" href="/contact">
              contact the school
            </Link>
            .
          </p>
        ) : null}
        {message ? (
          <p className="border-l-4 border-red bg-[#fff3f3] p-3" role="alert">
            {message}
          </p>
        ) : null}

        {informationGroups.map((group) => (
          <ApplicationFieldSection
            draft={draft}
            errors={errors}
            group={group}
            key={group.label}
            update={updateField}
          />
        ))}

        <fieldset className="grid min-w-0 gap-5 border-2 border-navy bg-white p-5 sm:p-6">
          <legend className="px-2 text-2xl font-bold text-navy">
            {applicationDocumentGroup.label}
          </legend>
          <p className="text-sm leading-6 text-ink">
            {applicationDocumentGroup.description}. Documents are optional until
            the school confirms the requirements.
          </p>
          {applicationDocumentDefinitions.map((document) => {
            const error = errors[document.name];
            const inputId = `application-${document.name}`;
            return (
              <label
                className="grid min-w-0 gap-2 font-semibold"
                htmlFor={inputId}
                key={document.name}
              >
                {document.label}
                <span className="min-w-0 break-words text-sm font-normal text-ink">
                  {document.hint}
                </span>
                <input
                  accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                  aria-describedby={error ? `${inputId}-error` : undefined}
                  aria-invalid={Boolean(error)}
                  className="min-h-12 w-full min-w-0 max-w-full border-2 border-navy bg-white p-2 text-ink"
                  id={inputId}
                  name={document.name}
                  onChange={(event) => changeDocument(document.name, event)}
                  type="file"
                />
                {documents[document.name] ? (
                  <span className="break-all text-sm font-normal">
                    Selected: {documents[document.name]?.name}
                  </span>
                ) : null}
                {error ? (
                  <span
                    className="text-sm font-normal text-red"
                    id={`${inputId}-error`}
                    role="alert"
                  >
                    {error}
                  </span>
                ) : null}
              </label>
            );
          })}
        </fieldset>

        {additionalNotesGroup ? (
          <ApplicationFieldSection
            draft={draft}
            errors={errors}
            group={additionalNotesGroup}
            update={updateField}
          />
        ) : null}

        <fieldset className="grid min-w-0 gap-5 border-2 border-navy bg-white p-5 sm:p-6">
          <legend className="px-2 text-2xl font-bold text-navy">
            Review and consent
          </legend>
          <div
            className="prose-school border-l-4 border-navy bg-mist p-4"
            dangerouslySetInnerHTML={{ __html: consentHtml }}
          />
          <p>
            The information is used to review this application and contact the
            parent or guardian. The school must confirm its retention period.
          </p>
          <label className="flex items-start gap-3 font-semibold">
            <input
              checked={draft.consent}
              className="mt-1 h-5 w-5"
              aria-describedby={
                errors.consent ? "application-consent-error" : undefined
              }
              aria-invalid={Boolean(errors.consent)}
              id="application-consent"
              onChange={(event) => {
                persistDraft({
                  ...draft,
                  consent: event.currentTarget.checked,
                });
                setErrors((current) => {
                  const next = { ...current };
                  delete next.consent;
                  return next;
                });
              }}
              type="checkbox"
            />
            <span>
              I confirm the information is true and consent to the school
              processing it for admission. *
            </span>
          </label>
          {errors.consent ? (
            <p
              className="text-sm text-red"
              id="application-consent-error"
              role="alert"
            >
              {errors.consent}
            </p>
          ) : null}
          {siteKey ? (
            <div
              aria-label="Security check"
              ref={turnstileContainer}
              role="group"
            />
          ) : (
            <p className="border-l-4 border-red bg-[#fff3f3] p-3">
              The security check is not configured. Please contact the school.
            </p>
          )}
        </fieldset>

        <button
          className="min-h-12 w-fit max-w-full border-[3px] border-navy bg-yellow px-5 font-bold uppercase text-navy disabled:cursor-not-allowed disabled:opacity-60"
          disabled={submitting || !turnstileToken || !submissionReady}
          type="submit"
        >
          {submitting ? "Sending application…" : "Submit Application"}
        </button>
      </form>
    </section>
  );
}
