const readEnv = (key: string) => {
  const value = import.meta.env[key];
  return typeof value === "string" ? value.trim() : "";
};

const DEFAULT_PROJECT_ID = "xpvuwatoahkbfkeytyig";
const DEFAULT_PUBLIC_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhwdnV3YXRvYWhrYmZrZXl0eWlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0MzYyMDQsImV4cCI6MjA4ODAxMjIwNH0.rssF6Qdw7AcPRQEl5IEO8VPapTV-SAVgPSAeSZCxIgo";

export const projectId = readEnv("VITE_SUPABASE_PROJECT_ID") || DEFAULT_PROJECT_ID;
export const publicAnonKey = readEnv("VITE_SUPABASE_ANON_KEY") || DEFAULT_PUBLIC_ANON_KEY;
export const kakaoRestApiKey = readEnv("VITE_KAKAO_REST_API_KEY");

export const hasPublicEnvConfig = Boolean(projectId && publicAnonKey);

export const getApiBase = () => {
  return `https://${projectId}.supabase.co/functions/v1/make-server-53dba95c`;
};

export const apiBase = getApiBase();
