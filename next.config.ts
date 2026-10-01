import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Card fonts are read from disk by the image routes; make sure they ship with serverless bundles.
  outputFileTracingIncludes: {
    "/api/cards/[id]/image": ["./src/assets/fonts/**"],
    "/api/cards/[id]/og": ["./src/assets/fonts/**"],
  },
};

export default nextConfig;
