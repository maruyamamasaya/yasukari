/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  async rewrites() {
    const backendOrigin =
      process.env.NEXT_PUBLIC_API_ORIGIN?.replace(/\/$/, '') || 'http://localhost:5000';

    return [
      {
        source: '/auth/:path*',
        destination: `${backendOrigin}/auth/:path*`,
      },
      {
        source: '/api/me',
        destination: `${backendOrigin}/api/me`,
      },
    ];
  },
};

module.exports = nextConfig;
