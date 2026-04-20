"use client";

export default function LessonPlayer({ lesson }) {

  return (
    <div>

      <h2>{lesson.title}</h2>

      <video
        width="800"
        controls
        src={lesson.videoUrl}
      />

      <p>{lesson.description}</p>

    </div>
  );
}