/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Disable the development overlay modal
  devIndicators: {
    buildActivity: false,
    buildActivityPosition: 'bottom-right',
  },
  // Disable the error overlay
  experimental: {
    errorOverlay: false,
  },
}

export default nextConfig
