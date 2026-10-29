import { StatCell } from "@/components/ui/StatCell";
import { numbers as seedNumbers, type NumberSeed } from "@/content/seed";

const cellBorders = [
  "border-b-[3px] border-r-[3px] min-[821px]:border-b-0",
  "border-b-[3px] min-[821px]:border-b-0 min-[821px]:border-r-[3px]",
  "border-r-[3px]",
  "",
];

export function NumbersStrip({
  items = seedNumbers,
}: {
  items?: NumberSeed[];
}) {
  return (
    <section
      aria-label="The college in numbers"
      className="bg-yellow text-navy"
    >
      <div className="mx-auto max-w-[1320px] px-10 max-[821px]:px-5">
        <div className="grid grid-cols-2 min-[821px]:grid-cols-4">
          {items.map((item, index) => (
            <StatCell
              key={item.value}
              value={item.value}
              label={item.label}
              className={`border-navy ${cellBorders[index] ?? ""}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
