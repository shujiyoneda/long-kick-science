import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import {unified} from '@astrojs/markdown-remark';
import remarkMath from 'remark-math';
import accessibleTables from './src/plugins/rehype-accessible-tables.mjs';
import rehypeKatex from 'rehype-katex';
export default defineConfig({
  output: 'static',
  server: {host:'0.0.0.0',port:4173},
  site: process.env.SITE_URL || undefined,
  base: process.env.BASE_PATH || '/',
  trailingSlash: 'always',
  integrations: [mdx()],
  markdown: {processor: unified({remarkPlugins:[remarkMath],rehypePlugins:[[rehypeKatex,{throwOnError:true}],accessibleTables]})},
  devToolbar: { enabled: false },
  vite: { server:{allowedHosts:['terminal.local']}, build: {chunkSizeWarningLimit:1200} }
});
