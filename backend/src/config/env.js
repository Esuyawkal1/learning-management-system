import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: process.env.PORT || 5000,
  mongoURI: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  nodeEnv: process.env.NODE_ENV || "development",
  chapaSecretKey: process.env.CHAPA_SECRET_KEY,
  chapaPublicKey: process.env.CHAPA_PUBLIC_KEY,
  chapaCurrency: process.env.CHAPA_CURRENCY || "ETB",
  chapaReturnUrl:
    process.env.CHAPA_RETURN_URL ||
    process.env.PAYMENT_RETURN_URL ||
    "https://frontend-deploy-hp0lvs92o-esuyawkal.vercel.app/payment/verify",
  chapaCallbackUrl:
    process.env.CHAPA_CALLBACK_URL ||
    process.env.PAYMENT_CALLBACK_URL ||
    "https://tech-folders-backend.onrender.com/api/v1/payment/verify",

  clientUrl:
    process.env.CLIENT_URL ||
    "https://frontend-deploy-hp0lvs92o-esuyawkal.vercel.app",


};
