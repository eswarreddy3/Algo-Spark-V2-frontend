import type { ReactNode } from "react";
import { PlayIcon, CheckIcon } from "./icons";

export function EditorWindow({
  filename,
  lang,
  children,
  runLabel,
  result,
  bordered = true,
}: {
  filename: string;
  lang: string;
  children: ReactNode;
  runLabel: string;
  result: string;
  bordered?: boolean;
}) {
  return (
    <div
      className={`bg-[#141834] rounded-[20px] overflow-hidden ${
        bordered ? "border border-white/[0.08]" : ""
      }`}
    >
      <div className="flex items-center gap-2 px-[15px] py-[13px] bg-[#1B2044] border-b border-white/[0.06]">
        <i className="w-[11px] h-[11px] rounded-full bg-[#FF5F57]" />
        <i className="w-[11px] h-[11px] rounded-full bg-[#FEBC2E]" />
        <i className="w-[11px] h-[11px] rounded-full bg-[#28C840]" />
        <span className="font-mono text-[12.5px] text-[#8E96C6] ml-1.5">{filename}</span>
        <span className="ml-auto font-mono text-[11px] text-sky bg-sky/[0.16] px-[9px] py-[3px] rounded-md">
          {lang}
        </span>
      </div>
      <div className="px-[18px] pt-[18px] pb-2 font-mono text-[13px] leading-[1.85] overflow-x-auto">
        {children}
      </div>
      <div className="flex items-center gap-3 px-[18px] py-[11px] bg-[#181C3C] border-t border-white/[0.06]">
        <button className="font-body font-semibold text-[12.5px] text-[#0E1230] rounded-lg px-[14px] py-[7px] inline-flex gap-1.5 items-center cursor-pointer border-none" style={{ backgroundImage: "var(--gold-grad)" }}>
          <PlayIcon className="w-3 h-3" />
          {runLabel}
        </button>
        <span className="ml-auto font-mono text-xs text-[#5AD6B0] flex items-center gap-1.5 font-medium">
          <CheckIcon className="w-3.5 h-3.5" />
          {result}
        </span>
      </div>
    </div>
  );
}

export function CodeLine({ children }: { children: ReactNode }) {
  return <span className="block whitespace-pre text-[#C4C9EC]">{children}</span>;
}
