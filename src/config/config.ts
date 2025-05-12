import dotenv from "dotenv";
dotenv.config();
export const config = {
    ENVIRONMENT: process.env.ENVIRONMENT,
    HOST: process.env.DB_HOST,
    USERNAME: process.env.DB_USERNAME,
    PASSWORD: process.env.DB_PASSWORD,
    DATABASE: process.env.DB_DATABASE,
    DB_DIALECT: process.env.DB_CONNECTION,
    DB_PORT: process.env.DB_PORT,
    BACKEND_URL: process.env.BACKEND_URL,
    REDIS_HOST: process.env.REDIS_HOST,
    REDIS_PORT: process.env.REDIS_PORT,
    EMAIL_HOST: process.env.EMAIL_HOST,
    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_PASS: process.env.EMAIL_PASS,
    EMAIL_NAME: process.env.EMAIL_NAME,
    EMAIL_PORT: process.env.EMAIL_PORT,
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_DURATION: process.env.JWT_DURATION,
    VIDEO_SIZE:process.env.VIDEO_SIZE
}
