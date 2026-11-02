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
  applicationFieldDefinitions,
  applicationFieldsSchema,
  applicationStepSchemas,
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

type Draft = Omit<ApplicationFields, "consent"> & { consent: boolean };
type FieldName = Exclude<ApplicationFieldName, "consent">;
type DocumentDraft = Record<ApplicationDocumentName, File | null>;

const draftStorageKey = "ombaci-application-draft-v1";
const draftChangedEvent = "ombaci:application-draft-changed";
const steps = [
  "Applicant",
  "Previous school and results",
  "Parent or guardian",
  "Documents",
  "Review and consent",
  "Submit",
] as const;

const emptyDraft: Draft = {
  applicantName: "",
  dateOfBirth: "",
  sex: "",
  nationality: "",
  entryClass: "Senior One",
  religion: "",
  previousSchool: "",
  schoolDistrict: "",
  completionYear: "",
  pleIndexNumber: "",
  pleAggregate: "",
  uceIndexNumber: "",
  uceResults: "",
  subjectPreferences: "",
  guardianName: "",
  guardianRelationship: "",
  guardianPhone: "",
  guardianWhatsApp: "",
  guardianEmail: "",
  residentialAddress: "",
  consent: false,
};

const emptyDocuments: DocumentDraft = {
  resultSlip: null,
  identityDocument: null,
  passportPhoto: null,
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
  return () => {
    window.removeEventListener(draftChangedEvent, callback);
  };
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
  field: (typeof applicationFieldDefinitions)[number]["fields"][number];
  draft: Draft;
  errors: Record<string, string>;
  update: (name: FieldName, value: string) => void;
}) {
  const name = field.name as FieldName;
  const value = draft[name];
  const error = errors[name];
  const optional = "optional" in field && field.optional;
  const requiredForClass =
    "entryClass" in field && field.entryClass === draft.entryClass;
  const required = !optional || requiredForClass;
  const id = `application-${name}`;
  const commonProps = {
    id,
    name,
    required,
    value,
    "aria-invalid": Boolean(error),
    "aria-describedby": error ? `${id}-error` : undefined,
    onChange: (
      event: ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) => update(name, event.currentTarget.value),
  };

  return (
    <label className="grid gap-2 font-semibold" htmlFor={id}>
      {field.label}
      {field.type === "select" ? (
        <select
          {...commonProps}
          className="min-h-12 border-2 border-navy bg-white px-3 text-ink"
        >
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
          maxLength={name === "uceResults" ? 500 : 300}
        />
      ) : (
        <input
          {...commonProps}
          className="min-h-12 border-2 border-navy bg-white px-3 text-ink"
          inputMode={"inputMode" in field ? field.inputMode : undefined}
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

export function ApplicationForm({
  siteKey,
  consentHtml,
}: {
  siteKey: string;
  consentHtml: string;
}) {
  const router = useRouter();
  const draftSnapshot = useSyncExternalStore(
    subscribeToDraft,
    getDraftSnapshot,
    getDraftServerSnapshot,
  );
  const draft = parseDraft(draftSnapshot);
  const [documents, setDocuments] = useState<DocumentDraft>(emptyDocuments);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [scriptReady, setScriptReady] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const turnstileContainer = useRef<HTMLDivElement>(null);

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
    if (
      !scriptReady ||
      step !== steps.length - 1 ||
      !turnstileContainer.current ||
      !window.turnstile
    ) {
      return;
    }

    const widgetId = window.turnstile.render(turnstileContainer.current, {
      sitekey: siteKey,
      callback: (token) => {
        setTurnstileToken(token);
        setMessage("");
      },
      "expired-callback": () => setTurnstileToken(""),
      "error-callback": () => {
        setTurnstileToken("");
        setMessage("The security check did not load. Please try again.");
      },
    });

    return () => window.turnstile?.remove(widgetId);
  }, [scriptReady, siteKey, step]);

  function updateField(name: FieldName, value: string) {
    persistDraft({ ...draft, [name]: value });
    setErrors((current) => {
      const next = { ...current };
      delete next[name];
      return next;
    });
  }

  function moveForward() {
    setMessage("");
    if (step < applicationStepSchemas.length) {
      const result = applicationStepSchemas[step].safeParse(draft);
      if (!result.success) {
        setErrors(
          Object.fromEntries(
            result.error.issues.map((issue) => [
              String(issue.path[0]),
              issue.message,
            ]),
          ),
        );
        return;
      }
    }

    if (step === 4 && !draft.consent) {
      setErrors({ consent: "Please confirm the consent statement." });
      return;
    }

    setErrors({});
    setTurnstileToken("");
    setStep((current) => Math.min(current + 1, steps.length - 1));
  }

  function moveBack() {
    setMessage("");
    setTurnstileToken("");
    setStep((current) => Math.max(0, current - 1));
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
    const validation = applicationFieldsSchema.safeParse(draft);
    if (!validation.success) {
      setErrors(
        Object.fromEntries(
          validation.error.issues.map((issue) => [
            String(issue.path[0]),
            issue.message,
          ]),
        ),
      );
      setStep(0);
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
      const result: unknown = await response.json();
      if (
        !result ||
        typeof result !== "object" ||
        !("reference" in result) ||
        typeof result.reference !== "string"
      ) {
        const serverMessage =
          result &&
          typeof result === "object" &&
          "error" in result &&
          typeof result.error === "string"
            ? result.error
            : "The application could not be submitted. Please try again.";
        throw new Error(serverMessage);
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
    }
  }

  const applicantFields = applicationFieldDefinitions[0].fields;
  const previousSchoolFields = applicationFieldDefinitions[1].fields.filter(
    (field) =>
      !("entryClass" in field) || field.entryClass === draft.entryClass,
  );
  const guardianFields = applicationFieldDefinitions[2].fields;
  const currentFieldList =
    step === 0
      ? applicantFields
      : step === 1
        ? previousSchoolFields
        : step === 2
          ? guardianFields
          : [];

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
        This proposed form is waiting for the school to confirm its fields and
        document requirements. Submitted information is used to review the
        application and contact the parent or guardian. The retention period
        needs school confirmation; see the{" "}
        <Link className="font-bold underline" href="/privacy">
          privacy notice
        </Link>
        .
      </p>
      <ol
        aria-label="Application progress"
        className="mb-8 grid gap-2 sm:grid-cols-3"
      >
        {steps.map((label, index) => (
          <li
            aria-current={index === step ? "step" : undefined}
            className={`border-b-2 p-2 text-sm font-bold ${
              index === step ? "border-red text-navy" : "border-line text-ink"
            }`}
            key={label}
          >
            {index + 1}. {label}
          </li>
        ))}
      </ol>

      <form className="grid gap-6" onSubmit={submitApplication}>
        <h2 className="text-[clamp(32px,5vw,56px)] leading-none">
          {steps[step]}
        </h2>
        {message ? (
          <p className="border-l-4 border-red bg-[#fff3f3] p-3" role="alert">
            {message}
          </p>
        ) : null}

        {currentFieldList.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2">
            {currentFieldList.map((field) => (
              <FormField
                draft={draft}
                errors={errors}
                field={field}
                key={field.name}
                update={updateField}
              />
            ))}
            {step === 1 &&
            draft.entryClass === "Senior Five" &&
            !errors.subjectPreferences ? (
              <p className="sm:col-span-2 text-sm text-ink">
                Subject preferences are optional while the current combinations
                are being confirmed.
              </p>
            ) : null}
          </div>
        ) : null}

        {step === 3 ? (
          <div className="grid gap-5">
            <p>
              Documents are optional while the school confirms its requirements.
              PDF, JPG, and PNG files up to 5 MB each are accepted.
            </p>
            {applicationDocumentDefinitions.map((document) => {
              const error = errors[document.name];
              return (
                <label className="grid gap-2 font-semibold" key={document.name}>
                  {document.label} (optional)
                  <input
                    accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                    className="min-h-12 border-2 border-navy bg-white p-2 text-ink"
                    name={document.name}
                    onChange={(event) => changeDocument(document.name, event)}
                    type="file"
                  />
                  {documents[document.name] ? (
                    <span className="text-sm font-normal">
                      Selected: {documents[document.name]?.name}
                    </span>
                  ) : null}
                  {error ? (
                    <span className="text-sm font-normal text-red" role="alert">
                      {error}
                    </span>
                  ) : null}
                </label>
              );
            })}
          </div>
        ) : null}

        {step === 4 ? (
          <div className="grid gap-5">
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
                onChange={(event) =>
                  persistDraft({
                    ...draft,
                    consent: event.currentTarget.checked,
                  })
                }
                type="checkbox"
              />
              <span>
                I confirm the information is true and consent to the school
                processing it for admission.
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
          </div>
        ) : null}

        {step === 5 ? (
          <div className="grid gap-5">
            <p>Review the application before submitting it to the school.</p>
            <dl className="grid gap-4 border-y-2 border-line py-4 sm:grid-cols-2">
              {applicationFieldDefinitions
                .flatMap((group) => group.fields)
                .filter(
                  (field) =>
                    draft[field.name as FieldName] &&
                    (!("entryClass" in field) ||
                      field.entryClass === draft.entryClass),
                )
                .map((field) => (
                  <div key={field.name}>
                    <dt className="font-bold">{field.label}</dt>
                    <dd className="break-words">
                      {draft[field.name as FieldName]}
                    </dd>
                  </div>
                ))}
            </dl>
            <div>
              <h3 className="mb-2 font-bold">Documents</h3>
              <ul className="list-inside list-disc">
                {applicationDocumentDefinitions.map((document) => (
                  <li key={document.name}>
                    {document.label}:{" "}
                    {documents[document.name]?.name ?? "Not attached"}
                  </li>
                ))}
              </ul>
            </div>
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
          </div>
        ) : null}

        <div className="flex flex-wrap gap-3 border-t-2 border-line pt-5">
          {step > 0 ? (
            <button
              className="min-h-12 border-[3px] border-navy bg-white px-5 font-bold uppercase text-navy"
              onClick={moveBack}
              type="button"
            >
              Back
            </button>
          ) : null}
          {step < steps.length - 1 ? (
            <button
              className="min-h-12 border-[3px] border-navy bg-yellow px-5 font-bold uppercase text-navy"
              onClick={moveForward}
              type="button"
            >
              Continue
            </button>
          ) : (
            <button
              className="min-h-12 border-[3px] border-navy bg-yellow px-5 font-bold uppercase text-navy disabled:cursor-not-allowed disabled:opacity-60"
              disabled={submitting || !turnstileToken}
              type="submit"
            >
              {submitting ? "Sending application…" : "Submit application"}
            </button>
          )}
        </div>
      </form>
    </section>
  );
}
