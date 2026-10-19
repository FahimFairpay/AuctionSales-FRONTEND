const ENV_LOOKUP = {
  AWS_REGION: process.env.NEXT_PUBLIC_AWS_REGION || process.env.AWS_REGION || "",
  USER_POOL_ID: process.env.NEXT_PUBLIC_USER_POOL_ID || process.env.USER_POOL_ID || "",
  USER_POOL_CLIENT_ID:
    process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID || process.env.USER_POOL_CLIENT_ID || "",
  API_BASE: process.env.NEXT_PUBLIC_API_BASE || process.env.API_BASE || "",
} as const;

export type RequiredEnvKey = keyof typeof ENV_LOOKUP;

function readEnv(name: RequiredEnvKey): string {
  const direct = ENV_LOOKUP[name];
  return direct ? String(direct).trim() : "";
}

function missingEnvNames(): RequiredEnvKey[] {
  const required: RequiredEnvKey[] = [
    "AWS_REGION",
    "USER_POOL_ID",
    "USER_POOL_CLIENT_ID",
    "API_BASE",
  ];
  return required.filter((name) => !readEnv(name));
}

export function requireConfig(): void {
  const missing = missingEnvNames();
  if (missing.length > 0) {
    throw new Error(
      `FairPy is missing environment variables: ${missing.map((m) => `NEXT_PUBLIC_${m}`).join(", ")}. Fill each value in .env.local.`
    );
  }
}

// Fail fast on module load if environment configuration is invalid
if (typeof window !== "undefined") {
  requireConfig();
}

// In the browser, always route through the Next.js /api proxy to prevent direct AWS API Gateway exposure
export const apiBaseUrl =
  typeof window !== "undefined"
    ? "/api"
    : readEnv("API_BASE").replace(/\/+$/, "") || "/api";
export const awsRegion = readEnv("AWS_REGION");
export const userPoolId = readEnv("USER_POOL_ID");
export const userPoolClientId = readEnv("USER_POOL_CLIENT_ID");

