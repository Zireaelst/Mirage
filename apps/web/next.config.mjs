/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    webpack: (config) => {
        // Required for wagmi/viem — handles node polyfills
        config.resolve.fallback = {
            ...config.resolve.fallback,
            fs: false,
            net: false,
            tls: false,
        }
        return config
    },
}

export default nextConfig
// ✓ next.config.mjs complete
