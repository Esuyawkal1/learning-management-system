"use client";

import { useEffect, useState } from "react";
import CategorySelect from "@/components/common/CategorySelect";
import CourseThumbnailUploader from "@/components/courses/CourseThumbnailUploader";
import { uploadCourseThumbnail } from "@/services/upload.service";

const initialValues = {
  title: "",
  description: "",
  categoryId: "",
  price: 0,
  thumbnailUrl: "",
  published: false,
};

const getInitialValues = (initialData) => ({
  title: initialData?.title || "",
  description: initialData?.description || "",
  categoryId: initialData?.categoryId?._id || initialData?.categoryId || "",
  price: initialData?.price || 0,
  thumbnailUrl: initialData?.thumbnailUrl || initialData?.thumbnail || "",
  published: initialData?.published || false,
});

export default function CourseForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
  formId,
  showActions = true,
  onDirtyChange,
  onValidityChange,
}) {
  const [initialFormData] = useState(() => getInitialValues(initialData || initialValues));
  const [formData, setFormData] = useState(initialFormData);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((currentState) => ({
      ...currentState,
      [name]: type === "checkbox" ? checked : name === "price" ? Number(value) : value,
    }));
  };

  const handleThumbnailUpload = async (file, onProgress) => {
    const thumbnailUrl = await uploadCourseThumbnail(file, onProgress);

    setFormData((currentState) => ({
      ...currentState,
      thumbnailUrl,
    }));

    return thumbnailUrl;
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!formData.categoryId) {
      setAttemptedSubmit(true);
      return;
    }

    onSubmit(formData);
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
    <form id={formId} onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-5 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Course Title</span>
          <input
            required
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700"
          />
        </label>

        <CategorySelect
          value={formData.categoryId}
          onChange={(categoryId) => {
            setFormData((currentState) => ({
              ...currentState,
              categoryId,
            }));
          }}
          required
          error={attemptedSubmit && !formData.categoryId ? "Category is required" : ""}
        />
      </div>

      <label className="space-y-2">
        <span className="text-sm font-medium text-slate-700">Description</span>
        <textarea
          required
          name="description"
          rows={5}
          value={formData.description}
          onChange={handleChange}
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700"
        />
      </label>

      <CourseThumbnailUploader
        value={formData.thumbnailUrl}
        courseTitle={formData.title}
        onUpload={handleThumbnailUpload}
        showUrlField={false}
        onUrlChange={(thumbnailUrl) =>
          setFormData((currentState) => ({
            ...currentState,
            thumbnailUrl,
          }))
        }
      />

      <div className="grid gap-5 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Price</span>
          <input
            min="0"
            name="price"
            type="number"
            value={formData.price}
            onChange={handleChange}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700"
          />
        </label>

        <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3">
          <input
            type="checkbox"
            name="published"
            checked={formData.published}
            onChange={handleChange}
            className="h-4 w-4 rounded border-slate-300"
          />
          <span className="text-sm font-medium text-slate-700">Published and visible to students</span>
        </label>
      </div>

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
            {isSubmitting ? "Saving..." : initialData ? "Update Course" : "Create Course"}
          </button>
        </div>
      ) : null}
    </form>
  );
}
