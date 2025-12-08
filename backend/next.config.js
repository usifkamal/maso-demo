/** @type {import('next').NextConfig} */
const nextConfig = {
  output: process.env.DOCKER_BUILD === 'true' ? 'standalone' : undefined,
  // Only set outputFileTracingRoot for Docker builds, not for Vercel
  ...(process.env.DOCKER_BUILD === 'true' && {
    outputFileTracingRoot: require('path').join(__dirname, '../../'),
  }),
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      sharp$: false,
      'onnxruntime-node$': false,
    };
    return config;
  },
};

module.exports = nextConfig;
