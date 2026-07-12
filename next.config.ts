import type { NextConfig } from "next";

/** Origem do NestJS para proxy em dev — NUNCA usar a mesma porta do Next. */
function getBackendOrigin(): string {
  const raw =
    process.env.BACKEND_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    "http://127.0.0.1:3000";
  return new URL(raw).origin;
}

const nextConfig: NextConfig = {
  async rewrites() {
    if (process.env.NODE_ENV !== "development") return [];
    try {
      const origin = getBackendOrigin();
      return [
        { source: "/api/v1/:path*", destination: `${origin}/api/v1/:path*` },
      ];
    } catch {
      return [];
    }
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.tmdb.org",
        pathname: "/t/p/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
};

export default nextConfig;
