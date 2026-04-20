"use client";

import Link from "next/link";
import { ArrowRight } from "@/components/common/icons";

export default function Breadcrumbs({ items = [] }) {
  if (!items.length) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <div key={`${item.label}-${index}`} className="flex items-center gap-2">
            {index > 0 ? <ArrowRight className="h-3.5 w-3.5 text-slate-300" /> : null}
            {item.href && !isLast ? (
              <Link href={item.href} className="transition hover:text-slate-700">
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? "font-semibold text-slate-900" : ""}>{item.label}</span>
            )}
          </div>
        );
      })}
    </nav>
  );
}
