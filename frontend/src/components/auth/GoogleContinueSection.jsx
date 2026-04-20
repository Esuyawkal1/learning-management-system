"use client";

import { useEffect, useState } from "react";

import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import { getGoogleAuthConfig } from "@/services/auth.service";

const staticClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

export default function GoogleContinueSection({
  onCredential,
  disabled = false,
}) {
  const [clientId, setClientId] = useState(staticClientId);

  useEffect(() => {
    if (staticClientId) {
      return undefined;
    }

    let isActive = true;

    const loadGoogleConfig = async () => {
      try {
        const response = await getGoogleAuthConfig();
        const nextClientId = response?.data?.clientId || "";

        if (isActive) {
          setClientId(nextClientId);
        }
      } catch (error) {
        console.error("Unable to load Google sign-in config", error);
      }
    };

    loadGoogleConfig();

    return () => {
      isActive = false;
    };
  }, []);

  if (!clientId) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-slate-400">
        <span className="h-px flex-1 bg-slate-200" />
        <span>or continue with Google</span>
        <span className="h-px flex-1 bg-slate-200" />
      </div>
      <GoogleSignInButton
        clientId={clientId}
        onCredential={onCredential}
        disabled={disabled}
      />
    </div>
  );
}
