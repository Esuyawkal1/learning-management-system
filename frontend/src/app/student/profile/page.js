"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import UserAvatar from "@/components/common/UserAvatar";
import ErrorMessage from "@/components/common/ErrorMessage";
import { getStudentProfile, updateStudentProfile } from "@/services/student/student.profile.service";
import { uploadProfileImage } from "@/services/upload.service";
import useAuthStore from "@/store/auth.store";
import { notify } from "@/store/notification.store";

function ProfileSkeleton() {
  return <div className="h-[520px] animate-pulse rounded-[2rem] bg-slate-200" />;
}

export default function StudentProfilePage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const currentUser = useAuthStore((state) => state.user);
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    profileImage: "",
    currentPassword: "",
    newPassword: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await getStudentProfile();
        setFormData((state) => ({
          ...state,
          name: response?.name || "",
          email: response?.email || "",
          profileImage: response?.profileImage || "",
        }));
        setError("");
      } catch (requestError) {
        setError(requestError.message || "Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (error) {
    return <ErrorMessage title="Profile unavailable" message={error} actionLabel="Retry" onAction={() => window.location.reload()} />;
  }

  return (
    <div className="mx-auto max-w-4xl rounded-[2rem] border border-sky-100 bg-white p-6 shadow-sm">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-sky-600">Profile</p>
        <h2 className="mt-3 text-2xl font-semibold text-slate-900">Manage your student profile and login details.</h2>
      </div>

      <form
        className="mt-8 space-y-5"
        onSubmit={async (event) => {
          event.preventDefault();

          try {
            setSaving(true);
            const payload = {
              name: formData.name,
              email: formData.email,
              profileImage: formData.profileImage,
            };

            if (formData.currentPassword || formData.newPassword) {
              payload.currentPassword = formData.currentPassword;
              payload.newPassword = formData.newPassword;
            }

            const updatedProfile = await updateStudentProfile(payload);
            login(updatedProfile);
            setFormData((state) => ({ ...state, currentPassword: "", newPassword: "" }));
            notify({
              type: "success",
              title: "Profile updated",
              message: "Your student profile was saved successfully.",
            });
            router.push("/student/dashboard");
          } catch (requestError) {
            notify({
              type: "error",
              title: "Unable to update profile",
              message: requestError.message,
            });
          } finally {
            setSaving(false);
          }
        }}
      >
        <div className="flex flex-col items-center gap-4 rounded-[1.75rem] border border-slate-200 bg-slate-50 px-6 py-6">
          <UserAvatar
            name={formData.name || currentUser?.name || "Student"}
            src={formData.profileImage}
            className="h-28 w-28 rounded-full text-2xl font-semibold"
            fallbackClassName="text-5xl font-semibold"
            fallback="first-letter"
          />

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            className="hidden"
            onChange={async (event) => {
              const file = event.target.files?.[0];
              event.target.value = "";

              if (!file) {
                return;
              }

              try {
                setUploadingImage(true);
                const uploadedUrl = await uploadProfileImage(file);
                const updatedProfile = await updateStudentProfile({
                  profileImage: uploadedUrl,
                });

                setFormData((state) => ({
                  ...state,
                  profileImage: updatedProfile?.profileImage || uploadedUrl,
                }));
                login({
                  ...(currentUser || {}),
                  ...updatedProfile,
                  profileImage: updatedProfile?.profileImage || uploadedUrl,
                });
                notify({
                  type: "success",
                  title: "Profile image uploaded",
                  message: "Your uploaded photo is now showing on your profile.",
                });
              } catch (requestError) {
                notify({
                  type: "error",
                  title: "Unable to upload profile image",
                  message: requestError.message || "Please try again in a moment.",
                });
              } finally {
                setUploadingImage(false);
              }
            }}
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingImage}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {uploadingImage ? "Uploading..." : "Upload photo"}
          </button>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Full name</span>
            <input
              value={formData.name}
              onChange={(event) => setFormData((state) => ({ ...state, name: event.target.value }))}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Email</span>
            <input
              type="email"
              value={formData.email}
              onChange={(event) => setFormData((state) => ({ ...state, email: event.target.value }))}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
            />
          </label>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Current password</span>
            <input
              type="password"
              value={formData.currentPassword}
              onChange={(event) => setFormData((state) => ({ ...state, currentPassword: event.target.value }))}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">New password</span>
            <input
              type="password"
              value={formData.newPassword}
              onChange={(event) => setFormData((state) => ({ ...state, newPassword: event.target.value }))}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
            />
          </label>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-70"
          >
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </form>
    </div>
  );
}
