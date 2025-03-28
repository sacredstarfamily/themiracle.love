/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export',
  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");
    return config;
  },
  env: {
    PAYPAL_CLIENT_SECRET: process.env.PAYPAL_CLIENT_SECRET
  }
};

export default nextConfig;
