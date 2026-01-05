const requiredPublicEnv = [
  "NEXT_PUBLIC_COGNITO_DOMAIN",
  "NEXT_PUBLIC_COGNITO_CLIENT_ID",
  "NEXT_PUBLIC_COGNITO_REDIRECT_URI",
  "NEXT_PUBLIC_COGNITO_LOGOUT_REDIRECT_URI",
  "NEXT_PUBLIC_COGNITO_REGION",
  "NEXT_PUBLIC_COGNITO_USER_POOL_ID",
];

const missingPublicEnv = requiredPublicEnv.filter((key) => !process.env[key]);
if (missingPublicEnv.length > 0 && process.env.NODE_ENV !== "test") {
  console.warn(
    `Missing required public env vars: ${missingPublicEnv.join(", ")}. ` +
      "Build will continue, but authentication features may not work until these are set.",
  );
}

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
    ];
  },
};

module.exports = nextConfig;
