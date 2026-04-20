"use client";

const baseProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

const createIcon = (paths) =>
  function Icon({ className = "h-4 w-4" }) {
    return (
      <svg {...baseProps} className={className}>
        {paths}
      </svg>
    );
  };

export const Search = createIcon(
  <>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </>
);

export const Menu = createIcon(
  <>
    <path d="M4 7h16" />
    <path d="M4 12h16" />
    <path d="M4 17h16" />
  </>
);

export const Bell = createIcon(
  <>
    <path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10 20a2 2 0 0 0 4 0" />
  </>
);

export const Lock = createIcon(
  <>
    <rect x="5" y="11" width="14" height="10" rx="2" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </>
);

export const X = createIcon(
  <>
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </>
);

export const Info = createIcon(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 10v6" />
    <path d="M12 7h.01" />
  </>
);

export const TriangleAlert = createIcon(
  <>
    <path d="M12 3 2 20h20L12 3Z" />
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
  </>
);

export const CheckCircle2 = createIcon(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="m9 12 2 2 4-4" />
  </>
);

export const LayoutDashboard = createIcon(
  <>
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="4" rx="1.5" />
    <rect x="14" y="10" width="7" height="11" rx="1.5" />
    <rect x="3" y="13" width="7" height="8" rx="1.5" />
  </>
);

export const BookOpen = createIcon(
  <>
    <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21z" />
    <path d="M4 5.5v15" />
  </>
);

export const BookOpenCheck = createIcon(
  <>
    <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21z" />
    <path d="M4 5.5v15" />
    <path d="m10 12 2 2 4-4" />
  </>
);

export const GraduationCap = createIcon(
  <>
    <path d="m2 10 10-5 10 5-10 5-10-5Z" />
    <path d="M6 12v4c0 1.5 3 3 6 3s6-1.5 6-3v-4" />
  </>
);

export const Users = createIcon(
  <>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </>
);

export const BarChart3 = createIcon(
  <>
    <path d="M4 20V10" />
    <path d="M12 20V4" />
    <path d="M20 20v-8" />
  </>
);

export const Settings = createIcon(
  <>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-.4-1.1 1.7 1.7 0 0 0-1-.6 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.1-.4H2.8a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.1-.4 1.7 1.7 0 0 0 .6-1 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1.1V2.8a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 .4 1.1 1.7 1.7 0 0 0 1 .6 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.4 9c.26.29.47.64.6 1 .13.35.4.62.75.75.36.13.71.34 1 .6.29.27.4.67.25 1.05-.16.38-.16.8 0 1.18.15.38.04.78-.25 1.05-.29.26-.64.47-1 .6-.35.13-.62.4-.75.75-.13.36-.34.71-.6 1Z" />
  </>
);

export const LogOut = createIcon(
  <>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="m16 17 5-5-5-5" />
    <path d="M21 12H9" />
  </>
);

export const PanelLeftClose = createIcon(
  <>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M9 3v18" />
    <path d="m16 15-3-3 3-3" />
  </>
);

export const PanelLeftOpen = createIcon(
  <>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M9 3v18" />
    <path d="m13 9 3 3-3 3" />
  </>
);

export const Plus = createIcon(
  <>
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </>
);

export const ArrowRight = createIcon(
  <>
    <path d="M5 12h14" />
    <path d="m13 5 7 7-7 7" />
  </>
);

export const Eye = createIcon(
  <>
    <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
    <circle cx="12" cy="12" r="3" />
  </>
);

export const Pencil = createIcon(
  <>
    <path d="M12 20h9" />
    <path d="m16.5 3.5 4 4L7 21l-4 1 1-4L16.5 3.5Z" />
  </>
);

export const Trash2 = createIcon(
  <>
    <path d="M3 6h18" />
    <path d="M8 6V4h8v2" />
    <path d="M19 6l-1 14H6L5 6" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
  </>
);

export const Ban = createIcon(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="m5 5 14 14" />
  </>
);

export const ShieldCheck = createIcon(
  <>
    <path d="M12 3 5 6v6c0 5 3.5 8 7 9 3.5-1 7-4 7-9V6l-7-3Z" />
    <path d="m9 12 2 2 4-4" />
  </>
);

export const MessageSquare = createIcon(
  <>
    <path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z" />
  </>
);

export const UserCircle = createIcon(
  <>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="10" r="3" />
    <path d="M6.5 18a6.5 6.5 0 0 1 11 0" />
  </>
);

export const UploadCloud = createIcon(
  <>
    <path d="M16 16.5a4.5 4.5 0 1 0-1-8.9A5.5 5.5 0 1 0 6 16.5" />
    <path d="M12 12v9" />
    <path d="m8.5 15.5 3.5-3.5 3.5 3.5" />
  </>
);

export const ChevronUp = createIcon(
  <>
    <path d="m18 15-6-6-6 6" />
  </>
);

export const ChevronDown = createIcon(
  <>
    <path d="m6 9 6 6 6-6" />
  </>
);

export const Filter = createIcon(
  <>
    <path d="M4 6h16" />
    <path d="M7 12h10" />
    <path d="M10 18h4" />
  </>
);

export const FileText = createIcon(
  <>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
    <path d="M14 2v6h6" />
    <path d="M8 13h8" />
    <path d="M8 17h8" />
    <path d="M8 9h2" />
  </>
);

export const Image = createIcon(
  <>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <circle cx="9" cy="10" r="1.5" />
    <path d="m21 16-5.5-5.5L7 19" />
  </>
);

export const PlayCircle = createIcon(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="m10 9 5 3-5 3Z" />
  </>
);

export const Heart = createIcon(
  <>
    <path d="m12 20-1.45-1.32C5.4 14 2 10.86 2 7.5A4.5 4.5 0 0 1 6.5 3C8.24 3 9.91 3.81 11 5.08 12.09 3.81 13.76 3 15.5 3A4.5 4.5 0 0 1 20 7.5c0 3.36-3.4 6.5-8.55 11.18L12 20Z" />
  </>
);
