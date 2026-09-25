/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      // Placeholder imagery used by the seed catalogue
      { protocol: "https", hostname: "placehold.co" },
    ],
  },
};

export default nextConfig;
