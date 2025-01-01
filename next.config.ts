import type { NextConfig } from "next";

const nextConfig: NextConfig = ({
  /* config options here */
  reactStrictMode: true,
  images: {
    domains: [
      "via.placeholder.com",
      "localhost",
      "cdna.pcpartpicker.com",
      "pc-builder.net",
      "pc-builder.io",
      "pcbuilderus.wpcomstaging.com",
      "pp_main_product_image",
      "res.cloudinary.com",
      "m.media-amazon.com"
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
});

export default nextConfig;
