/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // இது கேச் கோப்புகளை உருவாக்காமல் தடுக்கும்
  webpack: (config) => {
    config.cache = false;
    return config;
  },
};

module.exports = nextConfig;
