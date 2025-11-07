/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export',
  typescript: {
    // Ignore TypeScript errors during build for faster deployment
    ignoreBuildErrors: false,
  },
  eslint: {
    // Ignore ESLint errors during build for faster deployment
    ignoreDuringBuilds: false,
  },
  webpack: (config, { dev, webpack }) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");
    
    // Optimize FontAwesome imports
    config.resolve.alias = {
      ...config.resolve.alias,
      '@fortawesome/free-solid-svg-icons': '@fortawesome/free-solid-svg-icons',
      '@fortawesome/free-regular-svg-icons': '@fortawesome/free-regular-svg-icons',
      '@fortawesome/react-fontawesome': '@fortawesome/react-fontawesome',
      // Add path alias for src directory
      '@': './src',
    };
    
    // Remove SVG handling configuration that's causing the build error
    // SVG files can be imported directly as static assets in Next.js
    
    // Reduce console logging in production
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        minimize: true,
      };
      
      // Replace console methods in production using webpack parameter
      config.plugins.push(
        new webpack.DefinePlugin({
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
    // TypeScript configuration for better error handling
    typedRoutes: false,
    // Reduce layout shift warnings
    scrollRestoration: true,
  },
  // Reduce logging in production
  logging: {
    fetches: {
      fullUrl: process.env.NODE_ENV === 'development'
    }
  },
  // Transpile packages for better compatibility
  transpilePackages: [
    '@fortawesome/react-fontawesome',
    '@fortawesome/free-solid-svg-icons',
    '@fortawesome/free-regular-svg-icons',
    '@paypal/react-paypal-js',
  ],
  // Optimize for layout stability
  poweredByHeader: false,
};

// Enable Turbopack for faster development builds
nextConfig.turbo = {
  // Additional Turbopack-specific optimizations
  useSwcLoader: true,
  // Enable experimental features for better performance
  experimental: {
    // Optimize imports for better tree shaking
    optimizePackageImports: [
      '@fortawesome/react-fontawesome',
      '@fortawesome/free-solid-svg-icons',
      '@fortawesome/free-regular-svg-icons',
      'lucide-react',
      '@prisma/client',
    ],
  },
};

// Reduce logging in production
nextConfig.logging = {
  fetches: {
    fullUrl: process.env.NODE_ENV === 'development'
  }
};

// Optimize package imports for better performance
nextConfig.optimizePackageImports = [
  '@fortawesome/react-fontawesome',
  '@fortawesome/free-solid-svg-icons',
  '@fortawesome/free-regular-svg-icons',
  'lucide-react',
  '@paypal/react-paypal-js',
  '@prisma/client',
  'zustand',
];

// Enable HTTPS for local development
if (process.env.NODE_ENV === 'development') {
  import('fs').then(fs => {
    nextConfig.server = {
      https: {
        key: fs.readFileSync('./localhost-key.pem'),
        cert: fs.readFileSync('./localhost-cert.pem'),
      }
    };
  });
}

export default nextConfig;
