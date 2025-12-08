import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        ring: 'var(--ring)',
        border: 'var(--border)',
        primary: '#6b21a8', // purple-800
        'primary-foreground': '#ffffff',
        muted: '#f3f4f6', // gray-100
        'muted-foreground': '#6b7280', // gray-500
        accent: '#f9fafb', // gray-50
        'accent-foreground': '#1f2937', // gray-800
        destructive: '#dc2626', // red-600
        secondary: '#e5e7eb', // gray-200
        'secondary-foreground': '#374151', // gray-700
        card: '#ffffff',
        'card-foreground': '#1f2937', // gray-800
      },
      fontFamily: {
        'cheri': ['var(--font-cheri)', 'Georgia', 'Times New Roman', 'serif'],
        'sans': ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
};

export default config;
