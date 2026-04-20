"use client";

import { useState } from "react";

const initialValues = {
  name: "",
  email: "",
  password: "",
  role: "student",
  isActive: true,
};

const getInitialValues = (initialData) => ({
  name: initialData?.name || "",
  email: initialData?.email || "",
  password: "",
  role: initialData?.role || "student",
  isActive: initialData?.isActive !== false,
});

export default function UserForm({ initialData, onSubmit, onCancel, isSubmitting, mode = "edit" }) {
  const [formData, setFormData] = useState(() => getInitialValues(initialData || initialValues));

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((currentState) => ({
      ...currentState,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-5 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Full Name</span>
          <input
            required
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Email</span>
          <input
            required
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700"
          />
        </label>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Role</span>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700"
          >
            <option value="student">Student</option>
            <option value="instructor">Instructor</option>
            <option value="admin">Admin</option>
          </select>
        </label>

        <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3">
          <input
            type="checkbox"
            name="isActive"
            checked={formData.isActive}
            onChange={handleChange}
            className="h-4 w-4 rounded border-slate-300"
          />
          <span className="text-sm font-medium text-slate-700">Account is active</span>
        </label>
      </div>

      {mode === "create" ? (
        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Temporary Password</span>
          <input
            required
            minLength={6}
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700"
          />
        </label>
      ) : null}

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
          {isSubmitting ? "Saving..." : mode === "create" ? "Create User" : "Save User"}
        </button>
      </div>
    </form>
  );
}
