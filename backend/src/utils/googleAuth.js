import { AppError } from "./AppError.js";

const GOOGLE_TOKEN_INFO_URL = "https://oauth2.googleapis.com/tokeninfo";

export const verifyGoogleIdToken = async (credential) => {
  if (!credential) {
    throw new AppError("Google credential is required", 400);
  }

  if (!process.env.GOOGLE_CLIENT_ID) {
    throw new AppError("Google sign-in is not configured on the server", 503);
  }

  let response;

  try {
    response = await fetch(
      `${GOOGLE_TOKEN_INFO_URL}?id_token=${encodeURIComponent(credential)}`
    );
  } catch {
    throw new AppError("Unable to reach Google to verify this account", 503);
  }

  if (!response.ok) {
    throw new AppError("Unable to verify the Google account", 401);
  }

  const payload = await response.json();

  if (payload.aud !== process.env.GOOGLE_CLIENT_ID) {
    throw new AppError("Google sign-in is not configured for this app", 401);
  }

  if (!payload.email || String(payload.email_verified) !== "true") {
    throw new AppError("Google account email must already be verified", 400);
  }

  return {
    email: payload.email,
    googleId: payload.sub,
    name: payload.name,
    picture: payload.picture,
  };
};
