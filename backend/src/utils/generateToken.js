import jwt from "jsonwebtoken";

/**
 * Generate JWT token
 * @param {string} userId
 * @param {string} role
 * @returns {string}
 */
const generateToken = (userId, role = "user") => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
  }

  const payload = {
    id: userId,
    role,
  };

  const options = {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    issuer: process.env.JWT_ISSUER || "tech-learning-platform",
    audience: process.env.JWT_AUDIENCE || "tech-learning-users",
  };

  return jwt.sign(payload, process.env.JWT_SECRET, options);
};

/**
 * Generate access token
 * @param {string} userId
 * @param {string} role
 * @returns {string}
 */
export const generateAccessToken = (userId, role = "user") => {
  return generateToken(userId, role);
};

/**
 * Send refresh token as cookie
 * @param {Object} res - Express response object
 * @param {string} userId
 */
export const sendRefreshToken = (res, userId) => {
  const token = generateToken(userId);
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
    // domain may not be needed for localhost; set carefully if needed
    // domain: process.env.NODE_ENV === "production" ? ".yourdomain.com" : "localhost",
    maxAge: (process.env.COOKIE_EXPIRES_IN || 7) * 24 * 60 * 60 * 1000,
  });
};

export default generateToken;


