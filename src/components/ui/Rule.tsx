export type RuleTone = "navy" | "yellow" | "line" | "line-navy";

const tones: Record<RuleTone, string> = {
  navy: "border-navy",
  yellow: "border-yellow",
  line: "border-line",
  "line-navy": "border-line-navy",
};

export function Rule({
  tone = "navy",
  className = "",
}: {
  tone?: RuleTone;
  className?: string;
}) {
  return <hr className={`border-0 border-t-4 ${tones[tone]} ${className}`} />;
}
