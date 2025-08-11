/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Enforce linting in CI/builds for higher code quality
    ignoreDuringBuilds: false,
  },
  typescript: {
    // Fail builds on type errors to increase reliability
    ignoreBuildErrors: false,
  },
  images: {
    // Keep unoptimized until remote domains are configured
    unoptimized: true,
  },
}

export default nextConfig
