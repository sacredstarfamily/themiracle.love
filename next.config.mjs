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
  // Optimize font loading
  experimental: {
    optimizeCss: true,
  }
};

export default nextConfig;
