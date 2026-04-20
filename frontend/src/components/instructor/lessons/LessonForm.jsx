"use client";

import { useEffect, useState } from "react";
import LessonUploader from "@/components/instructor/lessons/LessonUploader";
import { uploadLessonVideo } from "@/services/upload.service";

const getInitialValues = (lesson, courses, defaultCourseId = "") => ({
  title: lesson?.title || "",
  content: lesson?.content || "",
  videoUrl: lesson?.videoUrl || "",
  pdfUrl: lesson?.pdfUrl || "",
  order: lesson?.order || 0,
  isPreview: lesson?.isPreview || false,
  published: lesson?.published || false,
  course: lesson?.course?._id || lesson?.course || defaultCourseId || courses[0]?._id || "",
});

export default function LessonForm({
  lesson,
  courses,
  onSubmit,
  onCancel,
  isSubmitting,
  formId,
  showActions = true,
  defaultCourseId = "",
  onDirtyChange,
  showVideoUrlField,
}) {
  const [initialFormData] = useState(() => getInitialValues(lesson, courses, defaultCourseId));
  const [formData, setFormData] = useState(initialFormData);
  const shouldShowVideoUrlField = showVideoUrlField ?? !lesson;

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((state) => ({
      ...state,
      [name]: type === "checkbox" ? checked : name === "order" ? Number(value) : value,
    }));
  };

  const handleVideoUpload = async (file, onProgress) => {
    const uploadedUrl = await uploadLessonVideo(file, onProgress);
    setFormData((state) => ({
      ...state,
      videoUrl: uploadedUrl,
    }));
    return uploadedUrl;
  };

  useEffect(() => {
    onDirtyChange?.(JSON.stringify(formData) !== JSON.stringify(initialFormData));
  }, [formData, initialFormData, onDirtyChange]);

  return (
    <form
      id={formId}
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(formData);
      }}
      className="space-y-5"
    >
      <div className="grid gap-5 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Lesson title</span>
          <input name="title" required value={formData.title} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm" />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Course</span>
          <select name="course" value={formData.course} onChange={handleChange} disabled={!courses.length} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm">
            {!courses.length ? <option value="">No courses available</option> : null}
            {courses.map((course) => <option key={course._id} value={course._id}>{course.title}</option>)}
          </select>
        </label>
      </div>
      <label className="space-y-2">
        <span className="text-sm font-medium text-slate-700">Content summary</span>
        <textarea name="content" rows={4} value={formData.content} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm" />
      </label>
      <div className="grid gap-5 lg:grid-cols-1">
        <LessonUploader
          label="Video"
          accept="video/*"
          kind="video"
          value={formData.videoUrl}
          showUrlField={shouldShowVideoUrlField}
          onUpload={handleVideoUpload}
          onUrlChange={(value) => setFormData((state) => ({ ...state, videoUrl: value }))}
        />
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Display order</span>
          <input name="order" type="number" min="0" value={formData.order} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm" />
        </label>
        <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3">
          <input type="checkbox" name="published" checked={formData.published} onChange={handleChange} className="h-4 w-4 rounded border-slate-300" />
          <span className="text-sm font-medium text-slate-700">Published and visible to students</span>
        </label>
      </div>
      <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3">
        <input type="checkbox" name="isPreview" checked={formData.isPreview} onChange={handleChange} className="h-4 w-4 rounded border-slate-300" />
        <span className="text-sm font-medium text-slate-700">Allow Preview</span>
      </label>
      {showActions ? (
        <div className="flex items-center justify-end gap-3">
          <button type="button" onClick={onCancel} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-70">
            {isSubmitting ? "Saving..." : lesson ? "Update Lesson" : "Create Lesson"}
          </button>
        </div>
      ) : null}
    </form>
  );
}
