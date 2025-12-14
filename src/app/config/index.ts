import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.join(process.cwd(), ".env") });

const frontend_url =
  process.env.NODE_ENV === "production"
    ? process.env.PROD_FRONTEND_URL
    : process.env.DEV_FRONTEND_URL;

const base_url =
  process.env.NODE_ENV === "production"
    ? process.env.PROD_BASE_URL
    : process.env.DEV_BASE_URL;

const envConfig = {
  DATABASE_URL: process.env.DATABASE_URL,
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
  JWT_SECRET_KEY: process.env.JWT_SECRET_KEY,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "5m",
  JWT_REFRESH_SECRET_KEY: process.env.JWT_REFRESH_SECRET_KEY,
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
  JWT_FORGOT_PASSWORD_SECRET_KEY: process.env.JWT_FORGOT_PASSWORD_SECRET_KEY,
  JWT_FORGOT_PASSWORD_EXPIRES_IN:
    process.env.JWT_FORGOT_PASSWORD_EXPIRES_IN || "10m",
  BCRYPT_SALT_ROUNDS: process.env.BCRYPT_SALT_ROUNDS
    ? parseInt(process.env.BCRYPT_SALT_ROUNDS, 10)
    : 10,

  NODE_ENV: process.env.NODE_ENV || "development",
  BASE_URL: base_url,
  FRONTEND_URL: frontend_url,
  FORGOT_PASSWORD_URL: `${frontend_url}/reset-password`,

  NODE_MAILER: {
    SENDER_EMAIL: process.env.SENDER_EMAIL,
    MAIL_PASS: process.env.MAIL_PASS,
  },
  CLOUDINARY: {
    CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME as string,
    API_KEY: process.env.CLOUDINARY_API_KEY as string,
    API_SECRET: process.env.CLOUDINARY_API_SECRET as string,
  },
};

export default envConfig;
