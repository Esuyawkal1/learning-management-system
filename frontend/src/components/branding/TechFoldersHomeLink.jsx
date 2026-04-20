import Link from "next/link";
import TechFoldersMark from "@/components/branding/TechFoldersMark";

export default function TechFoldersHomeLink({
  className = "",
  markClassName = "h-12 w-12 shrink-0",
  textWrapperClassName = "min-w-0",
  labelClassName = "text-slate-900",
  subtitle = "",
  subtitleClassName = "text-slate-500",
}) {
  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-3 rounded-3xl transition hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${className}`}
    >
      <TechFoldersMark className={markClassName} />
      <div className={textWrapperClassName}>
        <p className={`text-base font-semibold leading-tight ${labelClassName}`}>Tech-Folders</p>
        {subtitle ? (
          <p className={`mt-1 text-[11px] uppercase tracking-[0.28em] ${subtitleClassName}`}>{subtitle}</p>
        ) : null}
      </div>
      <span className="sr-only">Go to Tech-Folders home page</span>
    </Link>
  );
}
