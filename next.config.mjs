/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Skip lint errors during production build
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Skip type errors during production build
    ignoreBuildErrors: true,
  },
  images: {
    // Keep unoptimized until remote domains are configured
    unoptimized: true,
  },
}

export default nextConfig
