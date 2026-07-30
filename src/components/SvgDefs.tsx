export function SvgDefs() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2430D8" />
          <stop offset="1" stopColor="#4DA3F5" />
        </linearGradient>
        <linearGradient id="gg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F59E0B" />
          <stop offset="1" stopColor="#FBBF24" />
        </linearGradient>
        <radialGradient id="spg">
          <stop offset="0" stopColor="#FFF1B0" />
          <stop offset="55%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#FF8A00" />
        </radialGradient>
      </defs>
    </svg>
  );
}
