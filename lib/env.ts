function getEnvVar(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
}

export const env = {
  supabaseUrl: () => getEnvVar("NEXT_PUBLIC_SUPABASE_URL"),
  supabaseAnonKey: () => getEnvVar("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  appUrl: () => process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
} as const;
