/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  eslint: {
    // Run lint at build time; failures fail the build unless this is disabled
    ignoreDuringBuilds: false
  },
  compiler: {
    // Strip all debug console.log statements from production builds while
    // keeping console.error/console.warn for critical runtime tracking.
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false
  }
};

module.exports = nextConfig;