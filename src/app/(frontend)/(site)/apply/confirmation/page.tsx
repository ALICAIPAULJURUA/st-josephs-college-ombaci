import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Application received",
  robots: { index: false, follow: false },
};

export default async function ApplicationConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ reference?: string; notice?: string }>;
}) {
  const { reference, notice } = await searchParams;
  const safeReference =
    reference && /^[0-9a-f-]{36}$/i.test(reference) ? reference : null;

  return (
    <section className="mx-auto max-w-[920px] px-5 py-16 sm:px-10">
      <p className="mb-3 text-sm font-bold uppercase tracking-[0.16em] text-navy-2">
        Admissions
      </p>
      <h1 className="font-display text-[clamp(48px,9vw,88px)] font-black uppercase leading-[0.9] text-navy">
        Application received
      </h1>
      {safeReference ? (
        <p className="mt-6 text-lg">
          Your reference is{" "}
          <strong className="break-all">{safeReference}</strong>. Keep it if you
          need to contact the school.
        </p>
      ) : (
        <p className="mt-6 text-lg">
          The application has been received. Please keep the reference shown on
          the confirmation page.
        </p>
      )}
      <p className="mt-4 leading-7">
        The school will review the application. No response time has been
        confirmed.
      </p>
      {notice === "email" ? (
        <p className="mt-5 border-l-4 border-red bg-[#fff3f3] p-4" role="status">
          The school received your application, but could not send the email
          notice. Please keep your reference and contact the school if you need
          help.
        </p>
      ) : null}
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          className="border-[3px] border-navy bg-yellow px-5 py-3 font-bold uppercase text-navy"
          href="/"
        >
          Return home
        </Link>
        <Link
          className="border-[3px] border-navy bg-white px-5 py-3 font-bold uppercase text-navy"
          href="/contact"
        >
          Contact the school
        </Link>
      </div>
    </section>
  );
}
