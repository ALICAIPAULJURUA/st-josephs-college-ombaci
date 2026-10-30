import Image from "next/image";

const navy = "#0a2352";
const navySoft = "#17376f";
const yellow = "#fef800";
const soft = "#c9d4ea";

function Crest({ size }: { size: number }) {
  return (
    <Image
      src="/crest.png"
      alt="St. Joseph's College, Ombaci crest"
      width={size}
      height={size}
      priority
      style={{ display: "block", width: size, height: size }}
    />
  );
}

export function Logo() {
  return (
    <div
      style={{
        alignItems: "center",
        display: "flex",
        gap: 14,
        padding: "4px 0",
      }}
    >
      <span
        style={{
          background: yellow,
          display: "inline-flex",
          flex: "0 0 auto",
          padding: 7,
        }}
      >
        <Crest size={58} />
      </span>
      <span>
        <span
          style={{
            color: yellow,
            display: "block",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
          }}
        >
          St. Joseph&apos;s College
        </span>
        <span
          style={{
            color: "#ffffff",
            display: "block",
            fontSize: 30,
            fontWeight: 900,
            letterSpacing: "0.01em",
            lineHeight: 0.95,
            textTransform: "uppercase",
          }}
        >
          Ombaci
        </span>
        <span
          style={{
            color: soft,
            display: "block",
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: "0.14em",
            marginTop: 3,
            textTransform: "uppercase",
          }}
        >
          Arua City, Uganda
        </span>
      </span>
    </div>
  );
}

export function Icon() {
  return <Crest size={32} />;
}

export function LoginBrand() {
  return (
    <section
      aria-label="St. Joseph's College, Ombaci"
      style={{
        background: navy,
        borderBottom: `8px solid ${yellow}`,
        color: "#ffffff",
        marginBottom: 24,
        padding: "26px 24px 22px",
      }}
    >
      <Logo />
      <p
        style={{
          color: soft,
          fontSize: 13,
          lineHeight: 1.5,
          margin: "18px 0 0",
          maxWidth: 320,
        }}
      >
        Content management for the official school website. For authorised
        staff only.
      </p>
    </section>
  );
}

export function DashboardBrand() {
  return (
    <section
      aria-label="Website administration"
      style={{
        background: navy,
        borderLeft: `10px solid ${yellow}`,
        color: "#ffffff",
        marginBottom: 24,
        padding: "24px 26px",
      }}
    >
      <span
        style={{
          color: yellow,
          display: "block",
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.16em",
          marginBottom: 6,
          textTransform: "uppercase",
        }}
      >
        St. Joseph&apos;s College, Ombaci
      </span>
      <h1
        style={{
          color: "#ffffff",
          fontSize: 32,
          fontWeight: 900,
          letterSpacing: "0.01em",
          lineHeight: 0.95,
          margin: 0,
          textTransform: "uppercase",
        }}
      >
        Website dashboard
      </h1>
      <p
        style={{
          color: soft,
          fontSize: 14,
          lineHeight: 1.55,
          margin: "12px 0 0",
          maxWidth: 640,
        }}
      >
        Manage pages, news, notices, sports, staff, media and admissions
        enquiries. Published content appears on the public site.
      </p>
      <span
        aria-hidden="true"
        style={{
          background: navySoft,
          display: "block",
          height: 4,
          marginTop: 20,
          width: 72,
        }}
      />
    </section>
  );
}
