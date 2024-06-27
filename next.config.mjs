import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  reactStrictMode: false,
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    config.cache = {
      type: "filesystem",
      buildDependencies: {
        config: [__filename],
      },
      cacheDirectory: path.resolve(__dirname, ".next/cache/webpack"),
      name: `cache-${buildId}`,
      store: "pack",
      compression: "gzip",
      profile: true,
      customSerialize: (value) => {
        if (typeof value === "string" && value.length > 1000) {
          return Buffer.from(value);
        }
        return value;
      },
      customDeserialize: (value) => {
        if (Buffer.isBuffer(value)) {
          return value.toString();
        }
        return value;
      },
    };

    return config;
  },
};

export default nextConfig;
