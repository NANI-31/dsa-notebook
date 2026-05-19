import dotenv from "dotenv";
dotenv.config();

const requiredEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`❌ Missing required env variable: ${key}`);
  }
  return value;
};

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: process.env.PORT ? Number(process.env.PORT) : 5000,

  // Database
  MONGO_URI: requiredEnv("MONGO_URI"),

  // JWT
  // JWT_ACCESS_SECRET: requiredEnv("JWT_ACCESS_SECRET"),
  // JWT_REFRESH_SECRET: requiredEnv("JWT_REFRESH_SECRET"),
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || "7d",

  // Cloud storage
  // CLOUDINARY_CLOUD_NAME: requiredEnv("CLOUDINARY_CLOUD_NAME"),
  // CLOUDINARY_API_KEY: requiredEnv("CLOUDINARY_API_KEY"),
  // CLOUDINARY_API_SECRET: requiredEnv("CLOUDINARY_API_SECRET"),

  // Redis
  REDIS_URL: process.env.REDIS_URL || "redis://localhost:6379",
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || "",
};
