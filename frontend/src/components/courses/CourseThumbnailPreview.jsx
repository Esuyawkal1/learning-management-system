"use client";

import Image from "next/image";
import { useState } from "react";

const DEFAULT_COURSE_IMAGE = "/default-course.png";

export default function CourseThumbnailPreview({
  src,
  alt,
  className = "h-full w-full object-cover",
}) {
  const [failedSource, setFailedSource] = useState("");
  const requestedSource = src || DEFAULT_COURSE_IMAGE;
  const imageSrc = failedSource === requestedSource ? DEFAULT_COURSE_IMAGE : requestedSource;

  return (
    <Image
      src={imageSrc || DEFAULT_COURSE_IMAGE}
      alt={alt}
      fill
      unoptimized
      className={className}
      onError={() => setFailedSource(requestedSource)}
    />
  );
}
