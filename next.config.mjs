/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep dev chunks warm longer to reduce ChunkLoadError on hot reload
  onDemandEntries: {
    maxInactiveAge: 25 * 60 * 1000,
    pagesBufferLength: 5,
  },
};

export default nextConfig;
