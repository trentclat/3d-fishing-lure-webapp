/** @type {import('next').NextConfig} */
const nextConfig = {
  // Set the source directory to frontend/src
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  
  // Configure images
  images: {
    domains: ['localhost'],
    unoptimized: true, // For development
  },
  
  // Configure webpack for Three.js and other client-side libraries
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }
    return config;
  },
  
  // Experimental features (appDir is now stable in Next.js 14)
}

module.exports = nextConfig 