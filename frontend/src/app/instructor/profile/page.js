"use client";

import { useEffect, useState } from "react";
import Loader from "@/components/common/Loader";
import ErrorMessage from "@/components/common/ErrorMessage";
import { getInstructorProfile, updateInstructorProfile } from "@/services/instructor/instructor.analytics.service";
import { notify } from "@/store/notification.store";
import useAuthStore from "@/store/auth.store";

export default function InstructorProfilePage() {
  const login = useAuthStore((state) => state.login);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    profileImage: "",
    currentPassword: "",
    newPassword: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await getInstructorProfile();
        setFormData((state) => ({ ...state, name: response?.name || "", email: response?.email || "", profileImage: response?.profileImage || "" }));
        setError("");
      } catch (requestError) {
        setError(requestError.message || "Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  if (loading) return <Loader label="Loading profile..." />;
  if (error) return <ErrorMessage title="Profile unavailable" message={error} actionLabel="Retry" onAction={() => window.location.reload()} />;

  return (
    <div className="mx-auto max-w-4xl rounded-3xl border border-amber-100 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Profile</h2>
        <p className="mt-1 text-sm text-slate-500">Update your instructor profile, avatar URL, and password.</p>
      </div>

      <form
        className="mt-8 space-y-5"
        onSubmit={async (event) => {
          event.preventDefault();
          try {
            setSaving(true);
            const payload = { name: formData.name, email: formData.email, profileImage: formData.profileImage };
            if (formData.currentPassword || formData.newPassword) {
              payload.currentPassword = formData.currentPassword;
              payload.newPassword = formData.newPassword;
            }
            const updatedProfile = await updateInstructorProfile(payload);
            login(updatedProfile);
            setFormData((state) => ({ ...state, currentPassword: "", newPassword: "" }));
            notify({ type: "success", title: "Profile updated", message: "Your instructor profile was updated successfully." });
          } catch (requestError) {
            notify({ type: "error", title: "Unable to update profile", message: requestError.message });
          } finally {
            setSaving(false);
          }
        }}
      >
        <div className="grid gap-5 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Full name</span>
            <input value={formData.name} onChange={(e) => setFormData((state) => ({ ...state, name: e.target.value }))} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm" />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Email</span>
            <input type="email" value={formData.email} onChange={(e) => setFormData((state) => ({ ...state, email: e.target.value }))} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm" />
          </label>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Current password</span>
            <input type="password" value={formData.currentPassword} onChange={(e) => setFormData((state) => ({ ...state, currentPassword: e.target.value }))} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm" />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">New password</span>
            <input type="password" value={formData.newPassword} onChange={(e) => setFormData((state) => ({ ...state, newPassword: e.target.value }))} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm" />
          </label>
        </div>
        <div className="flex justify-end">
          <button type="submit" disabled={saving} className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-70">
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </form>
    </div>
  );
}
