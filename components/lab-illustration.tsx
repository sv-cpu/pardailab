export function LabIllustration() {
  return (
    <svg viewBox="0 0 640 520" role="img" aria-label="Схема рабочего места лаборатории: стол, экран и журнал наблюдений" className="h-auto w-full">
      <rect x="16" y="16" width="608" height="488" rx="28" fill="var(--card)" />
      <rect x="48" y="48" width="544" height="360" rx="18" fill="none" stroke="var(--border)" />
      <rect x="78" y="86" width="250" height="168" rx="12" fill="var(--background)" stroke="var(--graphite)" strokeOpacity="0.45" />
      <path d="M100 124 H292 M100 148 H250 M100 172 H270" stroke="var(--border)" strokeWidth="2" />
      <rect x="100" y="196" width="28" height="34" fill="var(--olive-soft)" />
      <rect x="136" y="180" width="28" height="50" fill="var(--olive)" />
      <rect x="172" y="206" width="28" height="24" fill="var(--graphite)" opacity="0.75" />
      <rect x="360" y="96" width="196" height="250" rx="12" fill="var(--background)" stroke="var(--graphite)" strokeOpacity="0.45" />
      <path d="M384 140 H532 M384 168 H500 M384 196 H520 M384 224 H470" stroke="var(--border)" strokeWidth="2" />
      <circle cx="392" cy="268" r="8" fill="none" stroke="var(--olive)" strokeWidth="2" />
      <path d="M388 268.5 L391 272 L398 263" stroke="var(--olive)" strokeWidth="1.6" fill="none" />
      <text x="410" y="273" fill="var(--olive)" fontFamily="var(--font-plex-mono), monospace" fontSize="13">
        №127
      </text>
      <path d="M70 430 H570" stroke="var(--graphite)" strokeOpacity="0.35" strokeWidth="1.5" />
      <circle cx="150" cy="392" r="10" fill="none" stroke="var(--olive)" strokeWidth="1.5" />
      <circle cx="230" cy="392" r="10" fill="var(--olive)" />
      <circle cx="310" cy="392" r="10" fill="none" stroke="var(--graphite)" strokeOpacity="0.5" strokeWidth="1.5" />
      <path d="M160 392 H220 M240 392 H300" stroke="var(--olive)" strokeWidth="1.5" />
    </svg>
  );
}
