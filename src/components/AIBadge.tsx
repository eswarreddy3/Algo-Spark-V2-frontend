import { Sparkle } from "./icons";

export function AIBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono text-[10.5px] font-medium tracking-wide text-violet bg-violet/[0.1] border border-violet/20 px-2.5 py-1 rounded-full flex-none ${className}`}
    >
      <Sparkle className="w-3 h-3" gradient="gg" />
      AI
    </span>
  );
}
