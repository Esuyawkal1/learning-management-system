"use client";
/* eslint-disable @next/next/no-img-element */

import { useState } from "react";
import { UserCircle } from "@/components/common/icons";
import { getInitials } from "@/utils/helpers";

function AvatarImage({ src, alt, fallback }) {
  const [imageErrored, setImageErrored] = useState(false);

  if (!src || imageErrored) {
    return fallback;
  }

  return (
    <img
      src={src}
      alt={alt}
      className="h-full w-full object-cover"
      loading="lazy"
      decoding="async"
      onError={() => setImageErrored(true)}
    />
  );
}

export default function UserAvatar({
  name = "User",
  src = "",
  alt,
  className = "",
  fallbackClassName = "",
  fallback = "initials",
}) {
  const trimmedName = String(name || "User").trim();
  const firstLetter = trimmedName.charAt(0).toUpperCase() || "U";
  const fallbackContent =
    fallback === "icon" ? (
      <UserCircle className={fallbackClassName || "h-1/2 w-1/2"} />
    ) : fallback === "first-letter" ? (
      <span className={fallbackClassName}>{firstLetter}</span>
    ) : (
      <span className={fallbackClassName}>{getInitials(name || "User")}</span>
    );

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden bg-slate-900 text-white ${className}`}
    >
      <AvatarImage key={src || "avatar-fallback"} src={src} alt={alt || `${name} profile`} fallback={fallbackContent} />
    </div>
  );
}
