// next.config.mjs
import createMDX from '@next/mdx'
import remarkGfm from 'remark-gfm';


/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],
  // Optionally, add any other Next.js config below
  experimental: {
    // For better Pyodide compatibility sometimes (might not be needed with latest Next.js)
    // webpackBuildWorker: true,
  }
};

const withMDX = createMDX({
  // Add MDX options here, if needed
  options: {
    remarkPlugins: [], // e.g., remark-gfm
    rehypePlugins: [],
    
  },
})
export default withMDX(nextConfig);