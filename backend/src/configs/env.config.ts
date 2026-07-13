import "dotenv/config";
import z from "zod";

const postgresRegex = /^postgresql?:\/\/(?:([^:]+)(?::([^@]+))?@)?([^:\/\s]+)(?::(\d+))?(?:\/([^\?\s]+))?(?:\?(.*))?$/;

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"], "NODE_ENV is invalid.")
    .default("development"),
  PORT: z.coerce.number("PORT must be a number.")
    .positive("PORT must be a positive number.")
    .nonoptional("PORT is required."),
  DATABASE_URL: z.url("DATABASE_URL must be a valid connection string URL.")
    .regex(postgresRegex, "DATABASE_URL must be a valid PostgreSQL connection string URL.")
    .nonoptional("DATABASE_URL is required"),
  JWT_SECRET: z.string("JWT_SECRET is invalid.")
    .trim()
    .min(32, "JWT_SECRET should be at least 32 characters long.")
    .nonempty("JWT_SECRET must not be an empty string.")
    .nonoptional("JWT_SECRET is required."),
  // Nodemailer config
  GMAIL_APP_USER: z.email("GMAIL_APP_USER is invalid.")
    .trim()
    .nonempty("GMAIL_APP_USER must not be an empty string.")
    .nonoptional("GMAIL_APP_USER is required."),
  GMAIL_APP_PASSWORD: z.string("GMAIL_APP_PASSWORD is invalid.")
    .trim()
    .nonempty("GMAIL_APP_PASSWORD must not be an empty string.")
    .nonoptional("GMAIL_APP_PASSWORD is required.")
});

export type EnvType = z.infer<typeof EnvSchema>;

const initializeEnv = () => {
  console.log("🔃 Initializing environment variables...");

  const result = EnvSchema.safeParse(process.env);

  if (!result.success) {
    const errors = z.prettifyError(result.error);
    console.error(errors);
    console.error("🛑 Shutting down server...");
    process.exit(1);
  }

  return result.data;
};

const env = initializeEnv();
export default env;

