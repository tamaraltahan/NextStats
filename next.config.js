const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  turbopack: {
    // Avoid picking up C:\Users\tamar\package-lock.json as the monorepo root
    root: path.join(__dirname),
  },
};

module.exports = nextConfig;
