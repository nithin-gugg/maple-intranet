import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    '@fullcalendar/common',
    '@fullcalendar/core',
    '@fullcalendar/react',
    '@fullcalendar/daygrid',
    '@fullcalendar/timegrid',
  ],
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
    return [
      {
        source: '/api/scorm-static/:path*',
        destination: `${backendUrl}/static/scorm/:path*`,
      },
      {
        source: '/api/learning-static/:path*',
        destination: `${backendUrl}/static/:path*`,
      },
    ];
  },
};

export default nextConfig;
