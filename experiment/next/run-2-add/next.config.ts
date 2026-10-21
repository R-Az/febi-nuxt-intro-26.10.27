import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    // Mantine は部品ごとのファイルに分かれているので、使う分だけ読み込む
    // （@tabler/icons-react は Next.js の既定の対象に入っている）
    optimizePackageImports: ["@mantine/core", "@mantine/hooks"],
  },
};

export default nextConfig;
