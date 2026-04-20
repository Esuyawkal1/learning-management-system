"use client";

import { useEffect, useState } from "react";
import CategorySelect from "@/components/common/CategorySelect";
import CourseDocumentsUploader from "@/components/courses/CourseDocumentsUploader";
import CourseThumbnailUploader from "@/components/courses/CourseThumbnailUploader";
import { uploadCourseThumbnail } from "@/services/upload.service";

const getInitialValues = (course) => ({
  title: course?.title || "",
  description: course?.description || "",
  categoryId: course?.categoryId?._id || course?.categoryId || "",
  price: course?.price || 0,
  thumbnailUrl: course?.thumbnailUrl || course?.thumbnail || "",
  documents: Array.isArray(course?.documents) ? course.documents : [],
});

export default function InstructorCourseForm({
  course,
  onSubmit,
  onCancel,
  isSubmitting,
  formId,
  showActions = true,
  onDirtyChange,
  onValidityChange,
}) {
  const [initialFormData] = useState(() => getInitialValues(course));
  const [formData, setFormData] = useState(initialFormData);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((state) => ({
      ...state,
      [name]: type === "checkbox" ? checked : name === "price" ? Number(value) : value,
    }));
  };

  const handleThumbnailUpload = async (file, onProgress) => {
    const thumbnailUrl = await uploadCourseThumbnail(file, onProgress);

    setFormData((state) => ({
      ...state,
      thumbnailUrl,
    }));

    return thumbnailUrl;
  };

  useEffect(() => {
    onDirtyChange?.(JSON.stringify(formData) !== JSON.stringify(initialFormData));
  }, [formData, initialFormData, onDirtyChange]);

  useEffect(() => {
    const isValid = Boolean(
      formData.title.trim() &&
      formData.description.trim() &&
      formData.categoryId
    );

    onValidityChange?.(isValid);
  }, [formData, onValidityChange]);

  return (
    <form
      id={formId}
      onSubmit={(event) => {
        event.preventDefault();

        if (!formData.categoryId) {
          setAttemptedSubmit(true);
          return;
        }

        onSubmit(formData);
      }}
      className="space-y-5"
    >
      <div className="grid gap-5 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Course title</span>
          <input name="title" required value={formData.title} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm" />
        </label>
        <CategorySelect
          value={formData.categoryId}
          onChange={(categoryId) => {
            setFormData((state) => ({
              ...state,
              categoryId,
            }));
          }}
          required
          error={attemptedSubmit && !formData.categoryId ? "Category is required" : ""}
        />
      </div>
      <label className="space-y-2">
        <span className="text-sm font-medium text-slate-700">Description</span>
        <textarea name="description" required rows={5} value={formData.description} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm" />
      </label>
      <CourseThumbnailUploader
        value={formData.thumbnailUrl}
        courseTitle={formData.title}
        onUpload={handleThumbnailUpload}
        showUrlField={false}
        onUrlChange={(thumbnailUrl) =>
          setFormData((state) => ({
            ...state,
            thumbnailUrl,
          }))
        }
      />
      <CourseDocumentsUploader
        documents={formData.documents}
        onChange={(documents) =>
          setFormData((state) => ({
            ...state,
            documents,
          }))
        }
      />
      <div className="grid gap-5 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Price</span>
          <input name="price" min="0" type="number" value={formData.price} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm" />
        </label>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          Admins publish courses after review. Your updates save as draft-safe changes here.
        </div>
      </div>
      {showActions ? (
        <div className="flex items-center justify-end gap-3">
          <button type="button" onClick={onCancel} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-70">
            {isSubmitting ? "Saving..." : course ? "Update Course" : "Create Course"}
          </button>
        </div>
      ) : null}
    </form>
  );
}
