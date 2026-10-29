export type IconName = "paw" | "dog" | "cat" | "bird" | "rabbit" | "search" | "alert-sign" | "home" | "pets" | "pin" | "user" | "plus" | "edit" | "trash" | "arrow" | "shield" | "heart" | "eye" | "menu" | "logout" | "check" | "warning" | "gps" | "mail" | "moon" | "sun" | "help"

export function Icon({ name, size = 22 }: { name: IconName; size?: number }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  }
  const paths: Record<IconName, React.ReactNode> = {
    paw: (
      <>
        <circle cx="7" cy="7" r="2.2" />
        <circle cx="17" cy="7" r="2.2" />
        <circle cx="4.5" cy="12.5" r="2" />
        <circle cx="19.5" cy="12.5" r="2" />
        <path d="M8 17.5c.8-3 2.1-4.5 4-4.5s3.2 1.5 4 4.5c.5 2-1.1 3.5-4 3.5s-4.5-1.5-4-3.5Z" />
      </>
    ),
    dog: (
      <>
        <path d="M7 9 4 6v6a8 8 0 0 0 16 0V6l-3 3" />
        <path d="M8 9c1-2 2-3 4-3s3 1 4 3M9 15h.01M15 15h.01" />
        <path d="M10 18c1.2 1 2.8 1 4 0M12 16v2" />
      </>
    ),
    cat: (
      <>
        <path d="m5 9-1-6 5 3a9 9 0 0 1 6 0l5-3-1 6v5a7 7 0 0 1-14 0V9Z" />
        <path d="M9 13h.01M15 13h.01M10 17h4M3 15h4M17 15h4" />
      </>
    ),
    bird: (
      <>
        <path d="M20 7c-5 0-6-4-10-4a6 6 0 0 0-1 11.9V21" />
        <path d="M9 15c6 0 9-3 11-8-4 2-7 2-10 0M6 21h6" />
        <circle cx="11" cy="7" r=".5" fill="currentColor" />
      </>
    ),
    rabbit: (
      <>
        <path d="M9 9C6 5 7 1 9 2c2 1 2 5 3 7M15 9c3-4 2-8 0-7-2 1-2 5-3 7" />
        <circle cx="12" cy="15" r="7" />
        <path d="M9.5 14h.01M14.5 14h.01M10 18h4M12 16v2" />
      </>
    ),
    search: (
      <>
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m15.5 15.5 5 5" />
      </>
    ),
    "alert-sign": (
      <>
        <path d="M6 3h12l2 3v15H4V6l2-3Z" />
        <path d="M12 8v6M12 18h.01" />
      </>
    ),
    home: (
      <>
        <path d="m3 11 9-8 9 8" />
        <path d="M5 10v10h14V10M9 20v-6h6v6" />
      </>
    ),
    pets: (
      <>
        <path d="M4 19c4-5 5-9 8-9s4 4 8 9" />
        <circle cx="7" cy="7" r="2" />
        <circle cx="17" cy="7" r="2" />
        <path d="M8 19h8" />
      </>
    ),
    pin: (
      <>
        <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="2.5" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </>
    ),
    plus: (
      <>
        <path d="M12 5v14M5 12h14" />
      </>
    ),
    edit: (
      <>
        <path d="m4 20 4.5-1 10-10a2.1 2.1 0 0 0-3-3l-10 10L4 20Z" />
        <path d="m14 7 3 3" />
      </>
    ),
    trash: (
      <>
        <path d="M4 7h16M9 7V4h6v3M7 7l1 14h8l1-14M10 11v6M14 11v6" />
      </>
    ),
    arrow: (
      <>
        <path d="M5 12h14M14 7l5 5-5 5" />
      </>
    ),
    shield: (
      <>
        <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" />
        <path d="m9 12 2 2 4-5" />
      </>
    ),
    heart: (
      <path d="M20.8 5.8a5.5 5.5 0 0 0-7.8 0L12 7l-1-1.2a5.5 5.5 0 0 0-7.8 7.8L12 22l8.8-8.4a5.5 5.5 0 0 0 0-7.8Z" />
    ),
    eye: (
      <>
        <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
        <circle cx="12" cy="12" r="2.5" />
      </>
    ),
    menu: (
      <>
        <path d="M4 6h16M4 12h16M4 18h16" />
      </>
    ),
    logout: (
      <>
        <path d="M10 17l5-5-5-5M15 12H3" />
        <path d="M14 4h6v16h-6" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    warning: (
      <>
        <path d="M12 3 2 21h20L12 3Z" />
        <path d="M12 9v5M12 18h.01" />
      </>
    ),
    gps: (
      <>
        <circle cx="12" cy="12" r="7" />
        <circle cx="12" cy="12" r="2" />
        <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
      </>
    ),
    moon: <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />,
    sun: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </>
    ),
    help: (
      <>
        <circle cx="12" cy="12" r="9.5" />
        <path d="M9.4 9.3a2.7 2.7 0 0 1 5.2.9c0 1.8-2.6 2.2-2.6 3.9M12 17h.01" />
      </>
    ),
    mail: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
      </>
    ),
  }
  return <svg {...common}>{paths[name]}</svg>
}
