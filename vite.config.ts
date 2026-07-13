import { defineConfig } from 'vite';
import { resolve } from 'path';

const cleanUrlPlugin = () => ({
  name: 'clean-urls',
  configureServer(server: any) {
    server.middlewares.use((req: any, res: any, next: any) => {
      if (req.url && !req.url.endsWith('/') && !req.url.includes('.')) {
        req.url += '.html';
      }
      next();
    });
  }
});

export default defineConfig({
  base: './',
  plugins: [cleanUrlPlugin()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        reference: resolve(__dirname, 'pages/color-reference.html')
      }
    }
  },
  server: {
    host: 'localhost',
    port: 5173,
    open: true
  }
});
