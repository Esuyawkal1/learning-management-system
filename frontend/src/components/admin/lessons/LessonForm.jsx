"use client";

import { useEffect, useState } from "react";

const initialValues = {
  title: "",
  content: "",
  videoUrl: "",
  order: 0,
  isPreview: false,
  published: false,
  course: "",
};

const getInitialValues = (initialData, courses, defaultCourseId = "") => ({
  title: initialData?.title || "",
  content: initialData?.content || "",
  videoUrl: initialData?.videoUrl || "",
  order: initialData?.order || 0,
  isPreview: initialData?.isPreview || false,
  published: initialData?.published || false,
  course: initialData?.course?._id || initialData?.course || defaultCourseId || courses[0]?._id || "",
});

export default function LessonForm({
  initialData,
  courses,
  onSubmit,
  onCancel,
  isSubmitting,
  formId,
  showActions = true,
  defaultCourseId = "",
  onDirtyChange,
}) {
  const [initialFormData] = useState(() =>
    getInitialValues(initialData || initialValues, courses, defaultCourseId)
  );
  const [formData, setFormData] = useState(initialFormData);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((currentState) => ({
      ...currentState,
      [name]: type === "checkbox" ? checked : name === "order" ? Number(value) : value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(formData);
  };

  useEffect(() => {
    onDirtyChange?.(JSON.stringify(formData) !== JSON.stringify(initialFormData));
  }, [formData, initialFormData, onDirtyChange]);

  return (
    <form id={formId} onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-5 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Lesson Title</span>
          <input
            required
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Assign to Course</span>
          <select
            required
            name="course"
            value={formData.course}
            onChange={handleChange}
            disabled={!courses.length}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700"
          >
            {!courses.length ? <option value="">No courses available</option> : null}
            {courses.map((course) => (
              <option key={course._id} value={course._id}>
                {course.title}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="space-y-2">
        <span className="text-sm font-medium text-slate-700">Lesson Content</span>
        <textarea
          name="content"
          rows={5}
          value={formData.content}
          onChange={handleChange}
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700"
        />
      </label>

      <div className="grid gap-5 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Video URL</span>
          <input
            name="videoUrl"
            value={formData.videoUrl}
            onChange={handleChange}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Display Order</span>
          <input
            min="0"
            name="order"
            type="number"
            value={formData.order}
            onChange={handleChange}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700"
          />
        </label>
      </div>

      <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3">
        <input
          type="checkbox"
          name="published"
          checked={formData.published}
          onChange={handleChange}
          className="h-4 w-4 rounded border-slate-300"
        />
        <span className="text-sm font-medium text-slate-700">Published and visible to learners</span>
      </label>

      <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3">
        <input
          type="checkbox"
          name="isPreview"
          checked={formData.isPreview}
          onChange={handleChange}
          className="h-4 w-4 rounded border-slate-300"
        />
        <span className="text-sm font-medium text-slate-700">Allow Preview</span>
      </label>

      {showActions ? (
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-70"
          >
            {isSubmitting ? "Saving..." : initialData ? "Update Lesson" : "Create Lesson"}
          </button>
        </div>
      ) : null}
    </form>
  );
}
