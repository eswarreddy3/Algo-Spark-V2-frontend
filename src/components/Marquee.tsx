import { Sparkle } from "./icons";

const words = ["Learn by doing", "Real code", "Weekly labs", "SQL & Big-O", "Mock interviews", "Think · Innovate"];

function Track() {
  return (
    <span className="inline-flex items-center gap-[26px]">
      {words.map((w) => (
        <span key={w} className="inline-flex items-center gap-[26px]">
          <span className="opacity-90">{w}</span>
          <Sparkle className="w-4 h-4 flex-none" />
        </span>
      ))}
    </span>
  );
}

export function Marquee() {
  return (
    <div className="relative z-[3] bg-ink text-white py-[18px] overflow-hidden whitespace-nowrap" aria-hidden="true">
      <div className="inline-flex items-center gap-[26px] font-display font-semibold text-[19px] animate-marquee">
        <Track />
        <Track />
      </div>
    </div>
  );
}
