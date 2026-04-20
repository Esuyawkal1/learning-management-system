import api from "./api";

export const registerUser = async (data) => {
  const res = await api.post("/auth/register", data);
  return res.data;
};

export const loginUser = async (data) => {
  const res = await api.post("/auth/login", data, {
    withCredentials: true, // ensure cookie is stored
  });

  return res.data;
};

export const verifyEmailCode = async (data) => {
  const res = await api.post("/auth/verify-email", data, {
    withCredentials: true,
  });

  return res.data;
};

export const resendVerificationCode = async (data) => {
  const res = await api.post("/auth/resend-verification", data);
  return res.data;
};

export const requestPasswordReset = async (data) => {
  const res = await api.post("/auth/forgot-password", data);
  return res.data;
};

export const resetPassword = async (data) => {
  const res = await api.post("/auth/reset-password", data);
  return res.data;
};

export const loginWithGoogleCredential = async (credential) => {
  const res = await api.post(
    "/auth/google",
    { credential },
    {
      withCredentials: true,
    }
  );

  return res.data;
};

export const getGoogleAuthConfig = async () => {
  const res = await api.get("/auth/google/config");
  return res.data;
};

export const getCurrentUser = async () => {
  return await api.get("/auth/me", { withCredentials: true });
};
export const logoutUser = async () => {
  await api.post("/auth/logout", {}, { withCredentials: true });
};
