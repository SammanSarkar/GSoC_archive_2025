/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/organizations/:path*',
        destination: 'https://api.gsocorganizations.dev/:path*',
      },
    ];
  },
  // Add experimental options to ensure proper handling of middleware for client-side navigation
  experimental: {
    serverComponentsExternalPackages: [],
  },
};

export default nextConfig; 