import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /*
   * Proxy de desenvolvimento pro gate (cpf_gate): o backend só libera CORS
   * pra origens cadastradas, então em dev o front chama /gate-api/* no
   * próprio localhost e o Next repassa server-side (sem CORS). Em produção
   * a NEXT_PUBLIC_API_BASE_URL aponta direto pra API e isso aqui não entra.
   */
  async rewrites() {
    if (process.env.NODE_ENV !== "development") return [];
    return [
      {
        source: "/gate-api/:path*",
        destination: "https://copsoq-quest-api-staging.onrender.com/api/v2/:path*",
      },
    ];
  },
};

export default nextConfig;
