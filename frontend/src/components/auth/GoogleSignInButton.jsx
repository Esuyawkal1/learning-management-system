"use client";

import { useEffect, useRef } from "react";

const GOOGLE_SCRIPT_SRC = "https://accounts.google.com/gsi/client";

let googleScriptPromise;

const loadGoogleScript = () => {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }

  if (window.google?.accounts?.id) {
    return Promise.resolve();
  }

  if (!googleScriptPromise) {
    googleScriptPromise = new Promise((resolve, reject) => {
      const existingScript = document.querySelector(
        `script[src="${GOOGLE_SCRIPT_SRC}"]`
      );

      if (existingScript) {
        existingScript.addEventListener("load", resolve, { once: true });
        existingScript.addEventListener(
          "error",
          () => reject(new Error("Failed to load Google Sign-In")),
          { once: true }
        );
        return;
      }

      const script = document.createElement("script");
      script.src = GOOGLE_SCRIPT_SRC;
      script.async = true;
      script.defer = true;
      script.onload = resolve;
      script.onerror = () =>
        reject(new Error("Failed to load Google Sign-In"));

      document.head.appendChild(script);
    });
  }

  return googleScriptPromise;
};

export default function GoogleSignInButton({
  clientId: configuredClientId,
  onCredential,
  disabled = false,
}) {
  const buttonRef = useRef(null);
  const credentialHandlerRef = useRef(onCredential);
  const clientId =
    configuredClientId || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  useEffect(() => {
    credentialHandlerRef.current = onCredential;
  }, [onCredential]);

  useEffect(() => {
    if (!clientId || !buttonRef.current) {
      return undefined;
    }

    let isActive = true;

    const renderButton = async () => {
      try {
        await loadGoogleScript();

        if (!isActive || !buttonRef.current || !window.google?.accounts?.id) {
          return;
        }

        buttonRef.current.innerHTML = "";

        window.google.accounts.id.initialize({
          client_id: clientId,
          ux_mode: "popup",
          callback: (response) => {
            if (response.credential) {
              credentialHandlerRef.current?.(response.credential);
            }
          },
        });

        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: "outline",
          size: "large",
          shape: "pill",
          text: "continue_with",
          width: buttonRef.current.offsetWidth || 320,
        });
      } catch (error) {
        console.error("Google Sign-In unavailable", error);
      }
    };

    renderButton();

    return () => {
      isActive = false;
    };
  }, [clientId]);

  if (!clientId) {
    return null;
  }

  return (
    <div className={disabled ? "pointer-events-none opacity-60" : ""}>
      <div ref={buttonRef} className="flex justify-center" />
    </div>
  );
}
