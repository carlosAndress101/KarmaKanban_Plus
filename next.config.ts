import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "/KarmaKanban",
  trailingSlash: true, // opcional, pero ayuda con rutas internas y estáticos
};

export default nextConfig;
