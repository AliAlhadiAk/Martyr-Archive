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
    // Keep unoptimized to avoid server optimization overhead
    unoptimized: true,
    // Allow Supabase storage images
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      // Keep S3 for backward compatibility during migration
      ...(process.env.AWS_BUCKET_NAME && process.env.AWS_REGION ? [
        {
          protocol: 'https',
          hostname: `${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com`,
          pathname: '/**',
        },
      ] : []),
    ],
  },
}

export default nextConfig
