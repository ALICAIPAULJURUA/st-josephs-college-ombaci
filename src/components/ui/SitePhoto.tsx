import Image from "next/image";

export type PhotoTone = "navy" | "navy-2" | "green" | "tint" | "mist" | "white";

export type PhotoRatio = "4/3" | "3/4" | "16/9" | "1/1" | "3/2" | "4/5";

const toneClasses: Record<PhotoTone, string> = {
  navy: "bg-navy text-white",
  "navy-2": "bg-navy-2 text-white",
  green: "bg-green text-white",
  tint: "bg-tint text-navy",
  mist: "bg-mist text-navy",
  white: "border-[3px] border-navy bg-white text-navy",
};

const ratioClasses: Record<PhotoRatio, string> = {
  "4/3": "aspect-[4/3]",
  "3/4": "aspect-[3/4]",
  "16/9": "aspect-[16/9]",
  "1/1": "aspect-square",
  "3/2": "aspect-[3/2]",
  "4/5": "aspect-[4/5]",
};

export function SitePhoto({
  src,
  alt,
  label = "Photo",
  tone = "navy-2",
  ratio,
  priority = false,
  sizes = "100vw",
  minHeight = 120,
  className = "",
}: {
  src?: string;
  alt: string;
  label?: string;
  tone?: PhotoTone;
  ratio?: PhotoRatio;
  priority?: boolean;
  sizes?: string;
  minHeight?: number;
  className?: string;
}) {
  const classes = [
    "relative flex items-center justify-center overflow-hidden px-7 py-5 text-center font-mono text-xs font-semibold uppercase leading-[1.4] tracking-[0.1em]",
    toneClasses[tone],
    ratio ? ratioClasses[ratio] : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes} style={{ minHeight }}>
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
        />
      ) : (
        <>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-3 h-[22px] w-[22px] border-l-[3px] border-t-[3px] opacity-75"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute bottom-3 right-3 h-[22px] w-[22px] border-b-[3px] border-r-[3px] opacity-75"
          />
          <span className="relative z-10">{label}</span>
        </>
      )}
    </div>
  );
}
