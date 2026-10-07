import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

function storeStatusMiddleware() {
  const filePath = path.resolve(process.cwd(), 'store-status.json');
  return {
    name: 'store-status-middleware',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === '/api/store-status') {
          if (req.method === 'GET') {
            try {
              if (fs.existsSync(filePath)) {
                const data = fs.readFileSync(filePath, 'utf-8');
                res.setHeader('Content-Type', 'application/json');
                res.end(data);
                return;
              }
            } catch (e) {
              console.error('Erro ao ler store-status.json:', e);
            }
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ isPaused: false }));
            return;
          }

          if (req.method === 'POST') {
            let body = '';
            req.on('data', (chunk) => {
              body += chunk;
            });
            req.on('end', () => {
              try {
                fs.writeFileSync(filePath, body, 'utf-8');
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: true }));
              } catch (e) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: e.message }));
              }
            });
            return;
          }
        }
        next();
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), storeStatusMiddleware()],
  server: {
    port: 3000,
    host: true
  }
});
