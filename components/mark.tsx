export function Mark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect x="1.5" y="1.5" width="29" height="29" rx="8" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M9 22.5V9.5h7.6c2.9 0 4.7 1.7 4.7 4.15 0 2.46-1.8 4.15-4.7 4.15H9"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle cx="23.2" cy="22.2" r="1.35" fill="currentColor" />
    </svg>
  );
}
