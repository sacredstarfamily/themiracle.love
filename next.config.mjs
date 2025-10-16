/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export',
  webpack: (config, { dev }) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");
    
    // Optimize FontAwesome imports
    config.resolve.alias = {
      ...config.resolve.alias,
      '@fortawesome/free-solid-svg-icons': '@fortawesome/free-solid-svg-icons',
    };
    
    // Reduce console logging in production
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        minimize: true,
      };
      
      // Replace console methods in production
      config.plugins.push(
        new config.webpack.DefinePlugin({
          'console.log': '(() => {})',
          'console.debug': '(() => {})',
          'console.info': '(() => {})',
        })
      );
    }
    
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
  },
  // Reduce logging in production
  logging: {
    fetches: {
      fullUrl: process.env.NODE_ENV === 'development'
    }
  }
};

export default nextConfig;
