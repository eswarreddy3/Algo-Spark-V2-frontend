import { ArrowRight } from "./icons";

type Variant = "blue" | "line" | "glass" | "spark";

const base =
  "inline-flex items-center gap-2.5 font-semibold text-[16px] px-6.5 py-3.5 rounded-2xl border-2 transition-all duration-200 cursor-pointer";

const variants: Record<Variant, string> = {
  blue: "text-white border-transparent shadow-[0_10px_24px_rgba(36,48,216,0.24)] hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(36,48,216,0.32)]",
  line: "bg-transparent text-ink border-line hover:border-royal hover:text-royal hover:-translate-y-0.5",
  spark:
    "group rounded-full text-ink border-transparent shadow-[0_8px_22px_rgba(245,158,11,0.35),inset_0_1px_0_rgba(255,255,255,0.45)] hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(245,158,11,0.5),inset_0_1px_0_rgba(255,255,255,0.45)] active:translate-y-0",
  glass: "bg-white/15 text-white border-white/40 hover:bg-white/25 hover:-translate-y-0.5 backdrop-blur-sm",
};

export function Button({
  href,
  children,
  variant = "blue",
  icon = false,
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  variant?: Variant;
  icon?: boolean;
  className?: string;
}) {
  const style =
    variant === "blue"
      ? { backgroundImage: "var(--blue-grad)" }
      : variant === "spark"
        ? { backgroundImage: "var(--gold-grad)" }
        : undefined;
  return (
    <a href={href} className={`${base} ${variants[variant]} ${className}`} style={style}>
      {children}
      {icon && (
        <ArrowRight
          className={`w-[17px] h-[17px] transition-transform duration-200 ${variant === "spark" ? "group-hover:translate-x-1" : ""}`}
        />
      )}
    </a>
  );
}
