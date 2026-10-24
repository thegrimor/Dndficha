import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @dndficha/rules is shipped as TypeScript source inside the monorepo.
  transpilePackages: ["@dndficha/rules"],
};

export default nextConfig;
