import { NextConfig } from "next";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

// Load the appropriate environment file based on NODE_ENV
const nodeEnv = process.env.NODE_ENV || "development";
const envFile = `.env${nodeEnv !== "development" ? `.${nodeEnv}` : ".local"}`;
const envPath = path.resolve(process.cwd(), envFile);

if (fs.existsSync(envPath)) {
    console.log(`Loading environment from ${envPath}`);
    dotenv.config({ path: envPath });
} else {
    console.log(`Environment file ${envPath} not found, using .env.local`);
    dotenv.config({ path: ".env.local" });
}

const nextConfig: NextConfig = {
    reactStrictMode: true,
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "res.cloudinary.com",
            },
        ],
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
};

export default nextConfig;
