const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { unoptimized: true },
  // Set turbopack root to silence the lockfile warning
  turbopack: {
    root: __dirname,
  },
};

module.exports = nextConfig;
