/** @type {import('next').NextConfig} */
import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const nextConfig = async () => {
  const config = {
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
      config.externals.push(
        "pino-pretty",
        "lokijs",
        "encoding",
        "porto",
        "porto/internal",
      );

      // Optimize FontAwesome imports
      config.resolve.alias = {
        ...config.resolve.alias,
        "@fortawesome/free-solid-svg-icons":
          "@fortawesome/free-solid-svg-icons",
        "@fortawesome/free-regular-svg-icons":
          "@fortawesome/free-regular-svg-icons",
        "@fortawesome/react-fontawesome": "@fortawesome/react-fontawesome",
        // Add path alias for src directory
        "@": "./src",
        // Provide fallback for React Native modules in web environment
        "@react-native-async-storage/async-storage": false,
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
            "console.log": "(() => {})",
            "console.debug": "(() => {})",
            "console.info": "(() => {})",
          }),
        );
      }

      return config;
    },
    env: {
      PAYPAL_CLIENT_SECRET: process.env.PAYPAL_CLIENT_SECRET,
    },
    // Image optimization settings
    images: {
      remotePatterns: [
        {
          protocol: "https",
          hostname: "**",
        },
        {
          protocol: "http",
          hostname: "localhost",
        },
      ],
      // Allow unoptimized images for uploaded files
      unoptimized: process.env.NODE_ENV === "development",
    },
    // Optimize font loading
    experimental: {
      // optimizeCss: true, // Removed as it may cause issues with Tailwind v4
      // Reduce layout shift warnings
      scrollRestoration: true,
    },
    // Reduce logging in production
    logging: {
      fetches: {
        fullUrl: process.env.NODE_ENV === "development",
      },
    },
    // Transpile packages for better compatibility
    transpilePackages: [
      "@fortawesome/react-fontawesome",
      "@fortawesome/free-solid-svg-icons",
      "@fortawesome/free-regular-svg-icons",
      "@paypal/react-paypal-js",
    ],
    // Optimize for layout stability
    poweredByHeader: false,
    typedRoutes: false,
    outputFileTracingRoot: __dirname, // Use Node.js workaround for ES modules
  };

  // Enable HTTPS for local development
  // Note: HTTPS is enabled via command line: next dev --experimental-https
  // Remove invalid server config

  return config;
};

export default nextConfig;
