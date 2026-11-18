import os from "node:os";
import type { NextConfig } from "next";

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
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
