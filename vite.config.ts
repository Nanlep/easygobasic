
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
    // Load env file based on `mode` in the current working directory.
    // Set the third parameter to '' to load all env vars regardless of the `VITE_` prefix.
    const env = loadEnv(mode, process.cwd(), '');

    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        {
          name: 'vercel-api-middleware',
          configureServer(server) {
            // Provide a mock Response object for Vercel functions running via Connect middleware
            server.middlewares.use(async (req, res, next) => {
              if (!req.url?.startsWith('/api/')) return next();
              
              const endpointName = req.url.split('?')[0].replace('/api/', '');
              const functionPath = path.resolve(__dirname, `api/${endpointName}.ts`);
              
              try {
                // Dynamically import the handler (using Vite's module runner to handle TS)
                const module = await server.ssrLoadModule(functionPath);
                const handler = module.default;
                
                if (typeof handler === 'function') {
                  // Enhance res with Vercel-like helpers if they aren't present
                  if (!('status' in res)) {
                    (res as any).status = function(code: number) {
                      res.statusCode = code;
                      return res;
                    };
                  }
                  if (!('json' in res)) {
                    (res as any).json = function(data: any) {
                      res.setHeader('Content-Type', 'application/json');
                      res.end(JSON.stringify(data));
                    };
                  }
                  
                  // Read body since Connect middleware doesn't do it automatically
                  if (req.method === 'POST') {
                    const buffers: any[] = [];
                    for await (const chunk of req) buffers.push(chunk);
                    const data = Buffer.concat(buffers).toString();
                    if (data) (req as any).body = JSON.parse(data);
                  }
                  
                  await handler(req, res);
                } else {
                  next();
                }
              } catch (err: any) {
                console.error(`Error executing ${endpointName}:`, err);
                res.statusCode = 500;
                res.end(JSON.stringify({ error: err.message }));
              }
            });
          }
        }
      ],
      define: {
        'process.env.SUPABASE_URL': JSON.stringify(env.SUPABASE_URL || process.env.SUPABASE_URL || ""),
        'process.env.SUPABASE_ANON_KEY': JSON.stringify(env.SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || ""),
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
