import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    // The repo root also has a package.json (script forwarding only) — pin
    // the app root here so Next doesn't infer the wrong workspace directory.
    root: path.join(__dirname),
  },
};

export default nextConfig;
