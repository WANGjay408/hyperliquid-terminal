import type { NextConfig } from "next";
import createNextPWA from "@ducanh2912/next-pwa";

const withPWA = createNextPWA({
    dest: "public",
    disable: process.env.NODE_ENV === "development",
    register: true,
    reloadOnOnline: true,
    cacheOnFrontEndNav: true,
    workboxOptions: {
        skipWaiting: true,
        clientsClaim: true,
        runtimeCaching: [
            // 静态资源（Next 打包产物、字体等）：先返回缓存，后台刷新
            {
                urlPattern: /^https?.*\/_next\/(static|image)\//i,
                handler: "StaleWhileRevalidate",
                options: {
                    cacheName: "static-assets",
                    expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 7 }, // 7d
                },
            },
            {
                urlPattern: /^https?.*\/fonts\//i,
                handler: "StaleWhileRevalidate",
                options: {
                    cacheName: "fonts",
                    expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 30 }, // 30d
                },
            },
            // 图片：优先缓存
            {
                urlPattern: /^https?.*\.(?:png|jpg|jpeg|svg|gif|webp|avif)$/i,
                handler: "CacheFirst",
                options: {
                    cacheName: "images",
                    expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 }, // 30d
                },
            },
            // Hyperliquid API：优先网络，超时则回退缓存
            {
                urlPattern: /^https:\/\/api\.hyperliquid\.xyz\/.*/i,
                handler: "NetworkFirst",
                options: {
                    cacheName: "api",
                    networkTimeoutSeconds: 10,
                    expiration: { maxEntries: 100, maxAgeSeconds: 60 }, // 60s
                },
            },
        ],
    },
});

const nextConfig: NextConfig = {
    reactStrictMode: true,
};

export default withPWA(nextConfig);







