/** @type {import('next').NextConfig} */
const nextConfig = {
  // 正式版与体验版各用各的构建目录，两个版本可以同时运行、互不覆盖
  distDir: process.env.NEXT_PUBLIC_WUKONG_TRIAL === '1' ? '.next-trial' : '.next',
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async headers() {
    return [{ source: '/(.*)', headers: [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Strict-Transport-Security', value: 'max-age=63072000' },
      { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
    ] }]
  },
}

export default nextConfig
