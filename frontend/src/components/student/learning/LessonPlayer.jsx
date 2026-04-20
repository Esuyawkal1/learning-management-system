"use client";

import { useEffect, useState } from "react";
import { FileText } from "@/components/common/icons";
import TrackedLessonVideo from "@/components/student/learning/TrackedLessonVideo";

const isDirectVideoUrl = (url = "") => /\.(mp4|webm|ogg)(\?.*)?$/i.test(url);

export default function LessonPlayer({ lesson, onVideoProgress }) {
  const [videoUnavailable, setVideoUnavailable] = useState(false);

  useEffect(() => {
    setVideoUnavailable(false);
  }, [lesson?._id]);

  if (!lesson) {
    return (
      <section className="rounded-[2rem] border border-sky-100 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-500">Select a lesson to begin learning.</p>
      </section>
    );
  }

  return (
    <section className="rounded-[2rem] border border-sky-100 bg-white p-6 shadow-sm">
      <div className="space-y-6">
        <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-slate-950">
          {lesson.videoUrl && !videoUnavailable ? (
            isDirectVideoUrl(lesson.videoUrl) ? (
              <TrackedLessonVideo
                lessonId={lesson._id}
                className="aspect-video w-full"
                src={lesson.videoUrl}
                onProgress={onVideoProgress}
                onError={() => setVideoUnavailable(true)}
              />
            ) : (
              <iframe
                className="aspect-video w-full"
                src={lesson.videoUrl}
                title={lesson.title}
                allowFullScreen
              />
            )
          ) : lesson.videoUrl ? (
            <div className="flex aspect-video items-center justify-center px-8 text-center text-white/80">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-sky-300">Video Player</p>
                <p className="mt-4 text-xl font-semibold">Video unavailable</p>
              </div>
            </div>
          ) : (
            <div className="flex aspect-video items-center justify-center px-8 text-center text-white/80">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-sky-300">Video Player</p>
                <p className="mt-4 text-xl font-semibold">
                  No lesson video has been added yet.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-slate-100 pt-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-600">
            Current Lesson
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">{lesson.title}</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            {lesson.content || "This lesson does not have additional lesson notes yet."}
          </p>
        </div>

        {lesson.pdfUrl ? (
          <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-4">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-2xl bg-white p-3 text-slate-700 shadow-sm">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Lesson PDF</h3>
                <p className="text-sm text-slate-500">
                  View the lesson handout and supporting reading below.
                </p>
              </div>
            </div>

            <div className="overflow-hidden rounded-[1.25rem] border border-slate-200 bg-white">
              <iframe
                className="h-[560px] w-full"
                src={lesson.pdfUrl}
                title={`${lesson.title} PDF`}
              />
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
