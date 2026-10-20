import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @dndficha/rules se publica como TypeScript fuente dentro del monorepo.
  transpilePackages: ["@dndficha/rules"],
};

export default nextConfig;
