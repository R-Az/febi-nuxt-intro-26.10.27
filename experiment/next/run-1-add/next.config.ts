import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    // Mantine は部品ごとのファイルが多いので、使っている部品だけを読み込む（@tabler/icons-react は既定で対象）
    optimizePackageImports: ["@mantine/core", "@mantine/dates", "@mantine/hooks"],
  },
};

export default nextConfig;
