"use client";

import dynamic from "next/dynamic";

const ApplicationForm = dynamic(
  () => import("./ApplicationForm").then((module) => module.ApplicationForm),
  {
    ssr: false,
    loading: () => <p role="status">Loading the application form...</p>,
  },
);
const ContactForm = dynamic(
  () => import("./ContactForm").then((module) => module.ContactForm),
  {
    ssr: false,
    loading: () => <p role="status">Loading the contact form...</p>,
  },
);
const ShareActions = dynamic(
  () => import("./ShareActions").then((module) => module.ShareActions),
  {
    ssr: false,
    loading: () => <p role="status">Loading sharing options...</p>,
  },
);

type Props =
  | {
      feature: "application";
      siteKey: string;
      consentHtml: string;
    }
  | {
      feature: "contact";
      siteKey: string;
      introduction: string;
    }
  | {
      feature: "share";
      title: string;
    };

export function PublicClientFeature(props: Props) {
  if (props.feature === "application") {
    return (
      <ApplicationForm
        consentHtml={props.consentHtml}
        siteKey={props.siteKey}
      />
    );
  }

  if (props.feature === "contact") {
    return (
      <ContactForm introduction={props.introduction} siteKey={props.siteKey} />
    );
  }

  return <ShareActions title={props.title} />;
}
