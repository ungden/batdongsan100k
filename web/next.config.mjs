/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 86400,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Allow all hostnames for now, especially for unsplash placeholders and supabase. Or we can specific if needed.
      },
    ],
  },
};

export default nextConfig;
