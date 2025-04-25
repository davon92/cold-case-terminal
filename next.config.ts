import type { NextConfig } from 'next';
import { join } from 'path';

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  webpack: (config) => {
    config.resolve.alias['@'] = join(__dirname);
    return config;
  },
};

export default nextConfig;