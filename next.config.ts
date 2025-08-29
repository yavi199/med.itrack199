import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_FIREBASE_API_KEY: "AIzaSyD9IOKISuv0-j3HKtQl-bfFYycAQLm50xk",
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: "med-itrack-470514.firebaseapp.com",
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: "med-itrack-470514",
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: "med-itrack-470514.appspot.com",
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: "922998764855",
    NEXT_PUBLIC_FIREBASE_APP_ID: "1:922998764855:web:bafbfb2535c62af23b96b2",
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  }
};

export default nextConfig;
