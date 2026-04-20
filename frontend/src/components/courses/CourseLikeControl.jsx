"use client";

import { Heart } from "@/components/common/icons";

export default function CourseLikeControl({
  likesCount = 0,
  isLiked = false,
  interactive = false,
  disabled = false,
  onClick,
  className = "",
}) {
  const content = (
    <>
      <Heart
        className={`h-4 w-4 ${isLiked ? "fill-current text-rose-500" : "text-slate-400"}`}
      />
      <span className="text-sm font-semibold text-slate-700">{Number(likesCount || 0)}</span>
    </>
  );

  if (!interactive) {
    return (
      <div
        className={`inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 ${className}`}
      >
        {content}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 transition ${
        isLiked
          ? "border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100"
          : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
      } disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      aria-pressed={isLiked}
      aria-label={isLiked ? "Unlike course" : "Like course"}
    >
      {content}
    </button>
  );
}
