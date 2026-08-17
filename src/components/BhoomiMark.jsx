export default function BhoomiMark({ compact = false, light = false }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-moss text-paper shadow-sm" aria-hidden="true">
        <svg viewBox="0 0 32 32" className="h-6 w-6" fill="none">
          <path d="M5 14.5 16 6l11 8.5v11.5H5V14.5Z" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
          <path d="M12 26v-7h8v7M9 15h.01M23 15h.01" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      </span>
      {!compact && <span className={`font-display text-2xl tracking-tight ${light ? "text-paper" : "text-ink"}`}>Bhoomi</span>}
    </div>
  );
}
