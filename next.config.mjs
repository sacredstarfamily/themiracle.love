/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export',
  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");
    
    // Optimize FontAwesome imports
    config.resolve.alias = {
      ...config.resolve.alias,
      '@fortawesome/free-solid-svg-icons': '@fortawesome/free-solid-svg-icons',
    };
    
    return config;
  },
  env: {
    PAYPAL_CLIENT_SECRET: process.env.PAYPAL_CLIENT_SECRET
  },
  // Image optimization settings
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      }
    ],
    // Allow unoptimized images for uploaded files
    unoptimized: process.env.NODE_ENV === 'development',
  },
  // Optimize font loading
  experimental: {
    optimizeCss: true,
  }
};

export default nextConfig;
