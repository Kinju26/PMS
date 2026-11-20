import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

function getLocalNetworkIps(): string[] {
  try {
    return Object.values(os.networkInterfaces())
      .flat()
      .filter((iface): iface is os.NetworkInterfaceInfo =>
        Boolean(iface && iface.family === "IPv4" && !iface.internal),
      )
      .map((iface) => iface.address);
  } catch {
    return [];
  }
}

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: [
    "localhost",
    "127.0.0.1",
    "192.168.*.*",
    "10.*.*.*",
    "172.*.*.*",
    ...getLocalNetworkIps(),
  ],
  cacheComponents: true,
  partialPrefetching: true,
  serverExternalPackages: ["@prisma/client", "prisma"],
  turbopack: {
    root: projectRoot,
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
