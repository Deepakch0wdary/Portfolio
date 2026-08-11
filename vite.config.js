import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import contactHandler from './api/contact.js'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env files in development
  const env = loadEnv(mode, process.cwd(), '');
  for (const [key, value] of Object.entries(env)) {
    process.env[key] = value;
  }

  return {
    plugins: [
      react(), 
      tailwindcss(),
      {
        name: 'contact-api-dev',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            const parsedUrl = req.url ? req.url.split('?')[0] : '';
            // Handle all requests to /api/contact
            if (parsedUrl === '/api/contact') {
              try {
                await contactHandler(req, res);
              } catch (error) {
                console.error('[Local API Middleware Error]:', error);
                if (!res.headersSent) {
                  res.writeHead(500, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ success: false, error: 'INTERNAL_SERVER_ERROR', message: 'Unable to send message' }));
                }
              }
            } else {
              next();
            }
          });
        }
      }
    ],
  }
})
