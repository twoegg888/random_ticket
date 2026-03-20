const readEnv = (key: string) => {
  const value = import.meta.env[key];
  return typeof value === "string" ? value.trim() : "";
};

export const projectId = readEnv("VITE_SUPABASE_PROJECT_ID");
export const publicAnonKey = readEnv("VITE_SUPABASE_ANON_KEY");
export const kakaoRestApiKey = readEnv("VITE_KAKAO_REST_API_KEY");

export const hasPublicEnvConfig = Boolean(projectId && publicAnonKey);

export const getApiBase = () => {
  if (!projectId || !publicAnonKey) {
    throw new Error("Missing VITE_SUPABASE_PROJECT_ID or VITE_SUPABASE_ANON_KEY");
  }

  return `https://${projectId}.supabase.co/functions/v1/make-server-53dba95c`;
};

export const apiBase = getApiBase();
