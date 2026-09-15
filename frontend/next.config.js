/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // The dev server keeps its build output in its own directory so a concurrent
  // `next build` (which always writes to .next) cannot overwrite the dev chunks
  // and leave every /_next/static request 404ing.
  distDir: process.env.NEXT_DIST_DIR || '.next',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      }
    ],
  },
}
module.exports = nextConfig
